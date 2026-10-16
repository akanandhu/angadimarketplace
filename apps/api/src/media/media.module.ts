import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ListingsModule } from '../listings/listings.module';
import { Queues } from '../queue/queues';
import { InternalMediaController } from './internal-media.controller';
import { ListingImagesController } from './listing-images.controller';
import { ListingImagesService } from './listing-images.service';

@Module({
  imports: [ListingsModule, BullModule.registerQueue({ name: Queues.MEDIA_PROCESSING })],
  controllers: [ListingImagesController, InternalMediaController],
  providers: [ListingImagesService],
})
export class MediaModule {}
