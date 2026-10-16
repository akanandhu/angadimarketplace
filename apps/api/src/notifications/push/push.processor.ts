import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../../prisma/prisma.service';
import { Queues } from '../../queue/queues';
import { PushSender } from './push-sender';

export interface PushJob {
  notificationId: string;
}

@Processor(Queues.PUSH_NOTIFICATIONS)
export class PushProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sender: PushSender,
  ) {
    super();
  }

  async process(job: Job<PushJob>): Promise<void> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: job.data.notificationId },
      include: { user: { include: { devices: true } } },
    });
    if (!notification) return;

    const tokens = notification.user.devices.map((device) => device.pushToken);
    const data = Object.fromEntries(
      Object.entries((notification.data as Record<string, string>) ?? {}).map(([k, v]) => [
        k,
        String(v),
      ]),
    );
    const stale = await this.sender.send(tokens, {
      title: notification.title,
      body: notification.body,
      data: { ...data, notificationId: notification.id, type: notification.type },
    });
    if (stale.length) {
      await this.prisma.userDevice.deleteMany({ where: { pushToken: { in: stale } } });
    }
  }
}
