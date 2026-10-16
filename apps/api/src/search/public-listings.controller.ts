import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';
import { SearchListingsDto } from './dto/search-listings.dto';
import { ListingViewsService } from './listing-views.service';
import { SearchService } from './search.service';

@ApiTags('listings')
@OptionalAuth()
@Controller('listings')
export class PublicListingsController {
  constructor(
    private readonly search: SearchService,
    private readonly views: ListingViewsService,
  ) {}

  @Get()
  list(@Query() query: SearchListingsDto, @CurrentUser() user?: AuthUser) {
    return this.search.search(query, user?.id);
  }

  @Get('sitemap')
  sitemap(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(1000), ParseIntPipe) limit: number,
  ) {
    return this.search.sitemap(Math.max(page, 1), Math.min(Math.max(limit, 1), 5000));
  }

  @Get(':slug')
  detail(@Param('slug') slug: string, @CurrentUser() user?: AuthUser) {
    return this.search.detail(slug, user?.id);
  }

  @Post(':listingId/view')
  @HttpCode(HttpStatus.NO_CONTENT)
  async view(
    @Param('listingId', ParseUUIDPipe) listingId: string,
    @Req() req: Request,
    @CurrentUser() user?: AuthUser,
  ) {
    await this.views.record(listingId, {
      userId: user?.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
    });
  }
}
