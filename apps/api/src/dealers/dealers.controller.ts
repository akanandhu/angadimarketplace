import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { SearchListingsDto } from '../search/dto/search-listings.dto';
import { UpsertDealerProfileDto } from './dealers.dto';
import { DealersService } from './dealers.service';

@ApiTags('dealers')
@Controller()
export class DealersController {
  constructor(private readonly dealers: DealersService) {}

  @ApiBearerAuth()
  @Get('me/dealer-profile')
  getOwn(@CurrentUser() user: AuthUser) {
    return this.dealers.getOwn(user.id);
  }

  @ApiBearerAuth()
  @Put('me/dealer-profile')
  upsertOwn(@CurrentUser() user: AuthUser, @Body() dto: UpsertDealerProfileDto) {
    return this.dealers.upsertOwn(user.id, dto);
  }

  @Public()
  @Get('dealers/:slug')
  getPublic(@Param('slug') slug: string) {
    return this.dealers.getPublic(slug);
  }

  @OptionalAuth()
  @Get('dealers/:slug/listings')
  listings(
    @Param('slug') slug: string,
    @Query() query: SearchListingsDto,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.dealers.listings(slug, query, user?.id);
  }
}
