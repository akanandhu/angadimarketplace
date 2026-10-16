import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Job, Queue } from 'bullmq';
import { Queues } from '../../queue/queues';
import { ObjectStorageService } from './object-storage.service';

interface CleanupJob {
  prefix: string;
}

/** Deletes stored objects asynchronously so request latency never depends on S3. */
@Injectable()
export class MediaCleanupService {
  constructor(@InjectQueue(Queues.MEDIA_CLEANUP) private readonly queue: Queue<CleanupJob>) {}

  async deletePrefix(prefix: string): Promise<void> {
    // Guard against accidentally wiping the bucket root.
    if (!prefix.startsWith('listings/') && !prefix.startsWith('users/')) return;
    await this.queue.add('delete-prefix', { prefix: prefix.endsWith('/') ? prefix : `${prefix}/` });
  }
}

@Processor(Queues.MEDIA_CLEANUP)
export class MediaCleanupProcessor extends WorkerHost {
  private readonly logger = new Logger(MediaCleanupProcessor.name);

  constructor(private readonly storage: ObjectStorageService) {
    super();
  }

  async process(job: Job<CleanupJob>): Promise<void> {
    const deleted = await this.storage.deletePrefix(job.data.prefix);
    this.logger.log(`Deleted ${deleted} objects under ${job.data.prefix}`);
  }
}
