import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../generated/prisma/client';
import { AppConfig } from '../config/app-config.service';
import { AccessTokenPayload, AuthUser } from './auth-user';

@Injectable()
export class AccessTokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: AppConfig,
  ) {}

  sign(user: Pick<User, 'id' | 'role'>, sessionId: string) {
    const payload: AccessTokenPayload = { sub: user.id, role: user.role, sid: sessionId };
    const expiresIn = this.config.get('JWT_ACCESS_TTL_SECONDS');
    return {
      accessToken: this.jwt.sign(payload, { expiresIn }),
      accessTokenExpiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    };
  }

  /** Returns null for any invalid or expired token. */
  verify(token: string): AuthUser | null {
    try {
      const payload = this.jwt.verify<AccessTokenPayload>(token);
      return { id: payload.sub, role: payload.role, sessionId: payload.sid };
    } catch {
      return null;
    }
  }
}
