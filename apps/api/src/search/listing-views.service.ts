import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import { sha256 } from '../common/utils/crypto';
import { PrismaService } from '../prisma/prisma.service';
import { Queues } from '../queue/queues';
import { REDIS } from '../redis/redis.module';

const PENDING_KEY = 'views:pending';
const DEDUP_WINDOW_SECONDS = 30 * 60;
const FLUSH_EVERY_MS = 60_000;

/** Views are non-critical: deduplicated and buffered in Redis, then batched into ListingStats. */
@Injectable()
export class ListingViewsService implements OnModuleInit {
  constructor(
    @Inject(REDIS) private readonly redis: Redis,
    private readonly prisma: PrismaService,
    @InjectQueue(Queues.LISTING_VIEWS) private readonly queue: Queue,
  ) {}

  async onModuleInit() {
    await this.queue.upsertJobScheduler('flush-views', { every: FLUSH_EVERY_MS });
  }

  async record(listingId: string, viewer: { userId?: string; ip?: string; userAgent?: string }) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { sellerId: true, status: true },
    });
    if (!listing || listing.status !== 'ACTIVE' || listing.sellerId === viewer.userId) return;

    const viewerKey = viewer.userId ?? sha256(`${viewer.ip}|${viewer.userAgent}`);
    const fresh = await this.redis.set(
      `views:seen:${listingId}:${viewerKey}`,
      '1',
      'EX',
      DEDUP_WINDOW_SECONDS,
      'NX',
    );
    if (fresh) await this.redis.hincrby(PENDING_KEY, listingId, 1);
  }

  async flush(): Promise<number> {
    const batchKey = `views:flushing:${Date.now()}`;
    try {
      await this.redis.rename(PENDING_KEY, batchKey);
    } catch {
      return 0; // Nothing buffered.
    }
    const counts = await this.redis.hgetall(batchKey);
    for (const [listingId, count] of Object.entries(counts)) {
      await this.prisma.listingStats.updateMany({
        where: { listingId },
        data: { viewCount: { increment: Number(count) } },
      });
    }
    await this.redis.del(batchKey);
    return Object.keys(counts).length;
  }
}

@Processor(Queues.LISTING_VIEWS)
export class ListingViewsProcessor extends WorkerHost {
  private readonly logger = new Logger(ListingViewsProcessor.name);

  constructor(private readonly views: ListingViewsService) {
    super();
  }

  async process(): Promise<void> {
    const flushed = await this.views.flush();
    if (flushed) this.logger.log(`Flushed views for ${flushed} listings`);
  }
}
