import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { VehicleCatalogueService } from './vehicle-catalogue.service';

@ApiTags('vehicle-catalogue')
@Public()
@Controller('vehicle-catalogue')
export class VehicleCatalogueController {
  constructor(private readonly catalogue: VehicleCatalogueService) {}

  @Get('brands')
  @ApiQuery({ name: 'search', required: false })
  brands(@Query('search') search?: string) {
    return this.catalogue.brands(search);
  }

  @Get('brands/:brandId/models')
  models(@Param('brandId', ParseUUIDPipe) brandId: string) {
    return this.catalogue.models(brandId);
  }

  @Get('models/:modelId/variants')
  variants(@Param('modelId', ParseUUIDPipe) modelId: string) {
    return this.catalogue.variants(modelId);
  }

  @Get('resolve')
  @ApiQuery({ name: 'model', required: false })
  resolve(@Query('brand') brand: string, @Query('model') model?: string) {
    return this.catalogue.resolve(brand ?? '', model);
  }
}
