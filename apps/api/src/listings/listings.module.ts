import { Module } from '@nestjs/common';
import { VehicleCatalogueModule } from '../vehicle-catalogue/vehicle-catalogue.module';
import { CarDetailsService } from './car-details.service';
import { ListingAccessService } from './listing-access.service';
import { ListingPublisherService } from './listing-publisher.service';
import { SellerListingsController } from './seller-listings.controller';
import { SellerListingsService } from './seller-listings.service';

@Module({
  imports: [VehicleCatalogueModule],
  controllers: [SellerListingsController],
  providers: [
    ListingAccessService,
    ListingPublisherService,
    SellerListingsService,
    CarDetailsService,
  ],
  exports: [ListingAccessService, ListingPublisherService],
})
export class ListingsModule {}
