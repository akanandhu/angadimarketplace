import { Injectable } from '@nestjs/common';
import { SessionService } from '../auth/session.service';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { Paginated } from '../common/pagination/paginated';
import { Prisma } from '../generated/prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminUsersQueryDto } from './dto/admin.dto';

const USER_INCLUDE = {
  district: { select: { name: true } },
  dealerProfile: { select: { businessName: true, slug: true } },
  _count: { select: { listings: { where: { status: { not: 'DRAFT' as const } } } } },
} satisfies Prisma.UserInclude;

type AdminUserRow = Prisma.UserGetPayload<{ include: typeof USER_INCLUDE }>;

/** Admin view; includes the phone number, which only moderators may see. */
function present(user: AdminUserRow) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    accountType: user.accountType,
    role: user.role,
    status: user.status,
    district: user.district?.name ?? null,
    dealer: user.dealerProfile,
    listingCount: user._count.listings,
    suspendedAt: user.suspendedAt?.toISOString() ?? null,
    suspensionReason: user.suspensionReason,
    memberSince: user.createdAt.toISOString(),
  };
}

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sessions: SessionService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(query: AdminUsersQueryDto) {
    const where = {
      status: query.status,
      ...(query.q
        ? {
            OR: [
              { name: { contains: query.q, mode: 'insensitive' as const } },
              { phone: { contains: query.q.replace(/\s/g, '') } },
            ],
          }
        : {}),
    };
    const [total, rows] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        include: USER_INCLUDE,
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
    ]);
    return Paginated.of(rows.map(present), total, query.page, query.limit);
  }

  async get(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: USER_INCLUDE,
    });
    if (!user) throw AppException.notFound(ErrorCode.USER_NOT_FOUND, 'User not found');
    return present(user);
  }

  /** Suspension revokes every session; the user's listings drop out of public search. */
  async suspend(userId: string, note?: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw AppException.notFound(ErrorCode.USER_NOT_FOUND, 'User not found');
    if (user.role === 'ADMIN') {
      throw AppException.forbidden(ErrorCode.FORBIDDEN, 'Administrators cannot be suspended');
    }
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        status: 'SUSPENDED',
        suspendedAt: new Date(),
        suspensionReason: note?.trim() || null,
      },
    });
    await this.sessions.revokeAllForUser(userId);
    await this.notifications.notify([
      {
        userId,
        type: 'ACCOUNT_SUSPENDED',
        title: 'Account suspended',
        body: 'Your Angadi account has been suspended by moderation.',
      },
    ]);
    return this.get(userId);
  }

  async unsuspend(userId: string) {
    const { count } = await this.prisma.user.updateMany({
      where: { id: userId, status: 'SUSPENDED' },
      data: { status: 'ACTIVE', suspendedAt: null, suspensionReason: null },
    });
    if (!count) throw AppException.notFound(ErrorCode.USER_NOT_FOUND, 'Suspended user not found');
    await this.notifications.notify([
      {
        userId,
        type: 'ACCOUNT_UNSUSPENDED',
        title: 'Account restored',
        body: 'Your Angadi account is active again.',
      },
    ]);
    return this.get(userId);
  }
}
