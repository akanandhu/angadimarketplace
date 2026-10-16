import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { hmac, randomDigits, safeEqual } from '../common/utils/crypto';
import { AppConfig } from '../config/app-config.service';
import { REDIS } from '../redis/redis.module';
import { SMS_PROVIDER, SmsProvider } from './sms/sms-provider';

const OTP_LENGTH = 6;
const OTP_TTL_SECONDS = 300;
const RESEND_DELAY_SECONDS = 30;
const MAX_VERIFY_ATTEMPTS = 5;
const MAX_REQUESTS_PER_HOUR = 5;

interface OtpState {
  phone: string;
  hash: string;
  attempts: number;
}

export interface OtpRequestResult {
  requestId: string;
  expiresAt: string;
  resendAfterSeconds: number;
}

/** OTP lifecycle in Redis: hashed codes, TTL, resend cooldown and attempt limits. */
@Injectable()
export class OtpService {
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    @Inject(SMS_PROVIDER) private readonly sms: SmsProvider,
    private readonly config: AppConfig,
  ) {}

  async request(phone: string): Promise<OtpRequestResult> {
    const cooldownKey = `otp:cooldown:${phone}`;
    const ttl = await this.redis.ttl(cooldownKey);
    if (ttl > 0) {
      throw new AppException(
        ErrorCode.OTP_RESEND_TOO_SOON,
        `Please wait ${ttl} seconds before requesting another OTP`,
        HttpStatus.TOO_MANY_REQUESTS,
        { retryAfterSeconds: ttl },
      );
    }

    const hourlyKey = `otp:hourly:${phone}`;
    const count = await this.redis.incr(hourlyKey);
    if (count === 1) await this.redis.expire(hourlyKey, 3600);
    if (count > MAX_REQUESTS_PER_HOUR) {
      throw new AppException(
        ErrorCode.RATE_LIMITED,
        'Too many OTP requests. Try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const requestId = randomUUID();
    const otp = randomDigits(OTP_LENGTH);
    const state: OtpState = { phone, hash: this.hash(requestId, otp), attempts: 0 };

    await this.redis
      .multi()
      .set(this.stateKey(requestId), JSON.stringify(state), 'EX', OTP_TTL_SECONDS)
      .set(cooldownKey, '1', 'EX', RESEND_DELAY_SECONDS)
      .exec();
    await this.sms.sendOtp(phone, otp);

    return {
      requestId,
      expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString(),
      resendAfterSeconds: RESEND_DELAY_SECONDS,
    };
  }

  /** Returns the verified phone number, consuming the OTP on success. */
  async verify(requestId: string, otp: string): Promise<string> {
    const key = this.stateKey(requestId);
    const raw = await this.redis.get(key);
    if (!raw) {
      throw new AppException(ErrorCode.OTP_EXPIRED, 'This OTP has expired. Request a new one.');
    }

    const state = JSON.parse(raw) as OtpState;
    if (state.attempts >= MAX_VERIFY_ATTEMPTS) {
      await this.redis.del(key);
      throw new AppException(
        ErrorCode.OTP_TOO_MANY_ATTEMPTS,
        'Too many incorrect attempts. Request a new OTP.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (!safeEqual(state.hash, this.hash(requestId, otp))) {
      state.attempts += 1;
      await this.redis.set(key, JSON.stringify(state), 'KEEPTTL');
      throw new AppException(ErrorCode.OTP_INVALID, 'Incorrect OTP', HttpStatus.BAD_REQUEST, {
        attemptsRemaining: MAX_VERIFY_ATTEMPTS - state.attempts,
      });
    }

    await this.redis.del(key);
    return state.phone;
  }

  private stateKey(requestId: string) {
    return `otp:req:${requestId}`;
  }

  private hash(requestId: string, otp: string) {
    return hmac(this.config.get('OTP_HASH_SECRET'), `${requestId}:${otp}`);
  }
}
