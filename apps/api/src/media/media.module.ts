import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ListingsModule } from '../listings/listings.module';
import { Queues } from '../queue/queues';
import { InternalMediaController } from './internal-media.controller';
import { ListingImagesController } from './listing-images.controller';
import { ListingImagesService } from './listing-images.service';
import { UserImagesController } from './user-images.controller';
import { UserImagesService } from './user-images.service';

@Module({
  imports: [ListingsModule, BullModule.registerQueue({ name: Queues.MEDIA_PROCESSING })],
  controllers: [ListingImagesController, UserImagesController, InternalMediaController],
  providers: [ListingImagesService, UserImagesService],
})
export class MediaModule {}
