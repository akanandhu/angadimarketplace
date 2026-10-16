import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { CarDetailsService } from './car-details.service';
import { CarDetailsDto } from './dto/car-details.dto';
import { CreateDraftDto, MyListingsQueryDto, UpdateListingDto } from './dto/seller-listing.dto';
import { ListingPublisherService } from './listing-publisher.service';
import { SellerListingsService } from './seller-listings.service';

const ListingId = () => Param('listingId', ParseUUIDPipe);

@ApiTags('seller-listings')
@ApiBearerAuth()
@Controller('me/listings')
export class SellerListingsController {
  constructor(
    private readonly listings: SellerListingsService,
    private readonly carDetails: CarDetailsService,
    private readonly publisher: ListingPublisherService,
  ) {}

  @Post('drafts')
  createDraft(@CurrentUser() user: AuthUser, @Body() dto: CreateDraftDto) {
    return this.listings.createDraft(user.id, dto.category);
  }

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: MyListingsQueryDto) {
    return this.listings.list(user.id, query);
  }

  @Get(':listingId')
  get(@CurrentUser() user: AuthUser, @ListingId() listingId: string) {
    return this.listings.get(listingId, user.id);
  }

  @Patch(':listingId')
  update(
    @CurrentUser() user: AuthUser,
    @ListingId() listingId: string,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listings.update(listingId, user.id, dto);
  }

  @Delete(':listingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDraft(@CurrentUser() user: AuthUser, @ListingId() listingId: string) {
    await this.listings.deleteDraft(listingId, user.id);
  }

  @Put(':listingId/car-details')
  async putCarDetails(
    @CurrentUser() user: AuthUser,
    @ListingId() listingId: string,
    @Body() dto: CarDetailsDto,
  ) {
    await this.carDetails.put(listingId, user.id, dto);
    return this.listings.get(listingId, user.id);
  }

  @Post(':listingId/publish')
  @HttpCode(HttpStatus.OK)
  async publish(@CurrentUser() user: AuthUser, @ListingId() listingId: string) {
    await this.publisher.publish(listingId, user.id);
    return this.listings.get(listingId, user.id);
  }

  @Post(':listingId/mark-sold')
  @HttpCode(HttpStatus.OK)
  markSold(@CurrentUser() user: AuthUser, @ListingId() listingId: string) {
    return this.listings.markSold(listingId, user.id);
  }

  @Post(':listingId/remove')
  @HttpCode(HttpStatus.OK)
  remove(@CurrentUser() user: AuthUser, @ListingId() listingId: string) {
    return this.listings.remove(listingId, user.id);
  }

  @Get(':listingId/stats')
  stats(@CurrentUser() user: AuthUser, @ListingId() listingId: string) {
    return this.listings.stats(listingId, user.id);
  }
}
