import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import Redis from 'ioredis';
import request from 'supertest';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app.setup';
import { SMS_PROVIDER, SmsProvider } from '../../src/auth/sms/sms-provider';
import { PrismaService } from '../../src/prisma/prisma.service';
import { REDIS } from '../../src/redis/redis.module';

/** Captures OTPs instead of sending SMS. */
class CapturingSms implements SmsProvider {
  readonly sent = new Map<string, string>();
  async sendOtp(phone: string, otp: string) {
    this.sent.set(phone, otp);
  }
}

const DYNAMIC_TABLES = [
  'notifications',
  'listing_reports',
  'contact_connections',
  'contact_requests',
  'favourites',
  'listing_stats',
  'listing_images',
  'car_details',
  'listings',
  'user_devices',
  'user_sessions',
  'dealer_profiles',
  'users',
];

export interface TestApp {
  app: NestExpressApplication;
  http: () => ReturnType<typeof request>;
  prisma: PrismaService;
  login: (phone: string, name?: string) => Promise<{ token: string; userId: string }>;
  reset: () => Promise<void>;
  close: () => Promise<void>;
}

export async function createTestApp(): Promise<TestApp> {
  const sms = new CapturingSms();
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(SMS_PROVIDER)
    .useValue(sms)
    .compile();
  const app = configureApp(moduleRef.createNestApplication<NestExpressApplication>());
  await app.init();

  const prisma = app.get(PrismaService);
  const redis = app.get<Redis>(REDIS);
  const http = () => request(app.getHttpServer());

  const login = async (phone: string, name?: string) => {
    const otpRes = await http().post('/api/v1/auth/otp/request').send({ phone }).expect(200);
    const otp = sms.sent.get(`+91${phone.slice(-10)}`)!;
    const verify = await http()
      .post('/api/v1/auth/otp/verify')
      .send({ requestId: otpRes.body.data.requestId, otp, clientType: 'MOBILE' })
      .expect(200);
    const token = verify.body.data.accessToken as string;
    if (name) {
      await http().patch('/api/v1/me').set('authorization', `Bearer ${token}`).send({ name });
    }
    return { token, userId: verify.body.data.user.id as string };
  };

  const reset = async () => {
    await prisma.$executeRawUnsafe(`TRUNCATE ${DYNAMIC_TABLES.join(', ')} CASCADE`);
    await redis.flushdb();
  };

  return { app, http, prisma, login, reset, close: () => app.close() };
}
