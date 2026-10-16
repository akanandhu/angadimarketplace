import { HttpStatus, Injectable } from '@nestjs/common';
import { ClientType, UserSession } from '../generated/prisma/client';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { randomToken, safeEqual, sha256 } from '../common/utils/crypto';
import { AppConfig } from '../config/app-config.service';
import { PrismaService } from '../prisma/prisma.service';

export interface IssuedSession {
  session: UserSession;
  /** Opaque `${sessionId}.${secret}`; only the secret hash is stored. */
  refreshToken: string;
}

const invalid = () =>
  new AppException(
    ErrorCode.REFRESH_TOKEN_INVALID,
    'Session expired. Please log in again.',
    HttpStatus.UNAUTHORIZED,
  );

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfig,
  ) {}

  async create(userId: string, clientType: ClientType, userAgent?: string): Promise<IssuedSession> {
    const secret = randomToken();
    const session = await this.prisma.userSession.create({
      data: {
        userId,
        clientType,
        userAgent: userAgent?.slice(0, 255),
        refreshTokenHash: sha256(secret),
        expiresAt: this.expiry(),
      },
    });
    return { session, refreshToken: `${session.id}.${secret}` };
  }

  /**
   * Validates and rotates a refresh token. Presenting a stale secret for a live
   * session is treated as token theft and revokes the session.
   */
  async rotate(refreshToken: string): Promise<IssuedSession> {
    const session = await this.findLive(refreshToken);
    const secret = randomToken();
    const updated = await this.prisma.userSession.update({
      where: { id: session.id },
      data: { refreshTokenHash: sha256(secret), lastUsedAt: new Date(), expiresAt: this.expiry() },
    });
    return { session: updated, refreshToken: `${updated.id}.${secret}` };
  }

  async revoke(refreshToken: string): Promise<void> {
    const [sessionId] = refreshToken.split('.');
    if (!sessionId) return;
    await this.prisma.userSession
      .updateMany({ where: { id: sessionId, revokedAt: null }, data: { revokedAt: new Date() } })
      .catch(() => undefined);
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async findLive(refreshToken: string): Promise<UserSession> {
    const [sessionId, secret] = refreshToken.split('.');
    if (!sessionId || !secret || !/^[0-9a-f-]{36}$/.test(sessionId)) throw invalid();

    const session = await this.prisma.userSession.findUnique({ where: { id: sessionId } });
    if (!session || session.revokedAt || session.expiresAt < new Date()) throw invalid();

    if (!safeEqual(session.refreshTokenHash, sha256(secret))) {
      await this.prisma.userSession.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      });
      throw invalid();
    }
    return session;
  }

  private expiry(): Date {
    return new Date(Date.now() + this.config.get('REFRESH_TTL_DAYS') * 24 * 60 * 60 * 1000);
  }
}
