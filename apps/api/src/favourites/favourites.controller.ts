import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Put,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PageQueryDto } from '../common/pagination/page-query.dto';
import { FavouritesService } from './favourites.service';

@ApiTags('favourites')
@ApiBearerAuth()
@Controller('me/favourites')
export class FavouritesController {
  constructor(private readonly favourites: FavouritesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() query: PageQueryDto) {
    return this.favourites.list(user.id, query);
  }

  @Put(':listingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async save(@CurrentUser() user: AuthUser, @Param('listingId', ParseUUIDPipe) listingId: string) {
    await this.favourites.save(user.id, listingId);
  }

  @Delete(':listingId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('listingId', ParseUUIDPipe) listingId: string,
  ) {
    await this.favourites.remove(user.id, listingId);
  }
}
