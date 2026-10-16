import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { Queues } from '../queue/queues';
import { ListingViewsProcessor, ListingViewsService } from './listing-views.service';
import { PublicListingsController } from './public-listings.controller';
import { SearchService } from './search.service';

@Module({
  imports: [BullModule.registerQueue({ name: Queues.LISTING_VIEWS })],
  controllers: [PublicListingsController],
  providers: [SearchService, ListingViewsService, ListingViewsProcessor],
  exports: [SearchService],
})
export class SearchModule {}
