import { Module } from '@nestjs/common';
import { VehicleCatalogueController } from './vehicle-catalogue.controller';
import { VehicleCatalogueService } from './vehicle-catalogue.service';

@Module({
  controllers: [VehicleCatalogueController],
  providers: [VehicleCatalogueService],
  exports: [VehicleCatalogueService],
})
export class VehicleCatalogueModule {}
