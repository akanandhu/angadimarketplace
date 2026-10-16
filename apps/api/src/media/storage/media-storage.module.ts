import { BullModule } from '@nestjs/bullmq';
import { Global, Module } from '@nestjs/common';
import { Queues } from '../../queue/queues';
import { MediaCleanupProcessor, MediaCleanupService } from './media-cleanup.service';
import { ObjectStorageService } from './object-storage.service';

@Global()
@Module({
  imports: [BullModule.registerQueue({ name: Queues.MEDIA_CLEANUP })],
  providers: [ObjectStorageService, MediaCleanupService, MediaCleanupProcessor],
  exports: [ObjectStorageService, MediaCleanupService],
})
export class MediaStorageModule {}
