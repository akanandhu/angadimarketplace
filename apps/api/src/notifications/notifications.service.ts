import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { NotificationType, Prisma } from '../generated/prisma/client';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { PageQueryDto } from '../common/pagination/page-query.dto';
import { Paginated } from '../common/pagination/paginated';
import { PrismaService } from '../prisma/prisma.service';
import { Queues } from '../queue/queues';
import { PushJob } from './push/push.processor';

export interface NotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
}

type Db = Prisma.TransactionClient | PrismaService;

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(Queues.PUSH_NOTIFICATIONS) private readonly pushQueue: Queue<PushJob>,
  ) {}

  /** Persists in-app notifications; call inside the caller's transaction when there is one. */
  persist(db: Db, inputs: NotificationInput[]) {
    return db.notification.createManyAndReturn({
      data: inputs.map((input) => ({ ...input, data: input.data ?? undefined })),
      select: { id: true },
    });
  }

  /** Enqueues mobile push delivery. Call after the transaction has committed. */
  async push(notifications: { id: string }[]): Promise<void> {
    await this.pushQueue.addBulk(
      notifications.map((notification) => ({
        name: 'send',
        data: { notificationId: notification.id },
      })),
    );
  }

  async notify(inputs: NotificationInput[]): Promise<void> {
    await this.push(await this.persist(this.prisma, inputs));
  }

  async list(userId: string, query: PageQueryDto) {
    const [total, rows] = await Promise.all([
      this.prisma.notification.count({ where: { userId } }),
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
    ]);
    return Paginated.of(
      rows.map((row) => ({
        id: row.id,
        type: row.type,
        title: row.title,
        body: row.body,
        data: row.data,
        isRead: Boolean(row.readAt),
        createdAt: row.createdAt.toISOString(),
      })),
      total,
      query.page,
      query.limit,
    );
  }

  async unreadCount(userId: string) {
    return { count: await this.prisma.notification.count({ where: { userId, readAt: null } }) };
  }

  async markRead(userId: string, notificationId: string): Promise<void> {
    const { count } = await this.prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { readAt: new Date() },
    });
    if (!count) {
      throw AppException.notFound(ErrorCode.NOTIFICATION_NOT_FOUND, 'Notification not found');
    }
  }

  async markAllRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  }
}
