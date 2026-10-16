import { HttpStatus, Injectable } from '@nestjs/common';
import { ClientType } from '../generated/prisma/client';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { normalizeIndianPhone } from '../common/utils/phone';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { AccessTokenService } from './access-token.service';
import { OtpService } from './otp.service';
import { SessionService } from './session.service';

const suspended = () =>
  new AppException(
    ErrorCode.USER_SUSPENDED,
    'This account has been suspended',
    HttpStatus.FORBIDDEN,
  );

@Injectable()
export class AuthService {
  constructor(
    private readonly otp: OtpService,
    private readonly sessions: SessionService,
    private readonly tokens: AccessTokenService,
    private readonly users: UsersService,
    private readonly prisma: PrismaService,
  ) {}

  requestOtp(rawPhone: string) {
    const phone = normalizeIndianPhone(rawPhone);
    if (!phone) {
      throw new AppException(ErrorCode.VALIDATION_ERROR, 'Enter a valid Indian mobile number');
    }
    return this.otp.request(phone);
  }

  async verifyOtp(requestId: string, code: string, clientType: ClientType, userAgent?: string) {
    const phone = await this.otp.verify(requestId, code);
    const { user, isNewUser } = await this.users.findOrCreateByPhone(phone);
    if (user.status === 'SUSPENDED') throw suspended();

    const { session, refreshToken } = await this.sessions.create(user.id, clientType, userAgent);
    return {
      ...this.tokens.sign(user, session.id),
      refreshToken,
      refreshTokenExpiresAt: session.expiresAt,
      isNewUser,
      user: await this.users.getMe(user.id),
    };
  }

  async refresh(refreshToken: string) {
    const { session, refreshToken: next } = await this.sessions.rotate(refreshToken);
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: session.userId } });
    if (user.status === 'SUSPENDED') {
      await this.sessions.revokeAllForUser(user.id);
      throw suspended();
    }
    return {
      ...this.tokens.sign(user, session.id),
      refreshToken: next,
      refreshTokenExpiresAt: session.expiresAt,
      clientType: session.clientType,
    };
  }

  logout(refreshToken: string | undefined) {
    return refreshToken ? this.sessions.revoke(refreshToken) : Promise.resolve();
  }
}
