import {
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ReorderImagesDto, UploadRequestDto } from './dto/image.dto';
import { ListingImagesService } from './listing-images.service';

const ListingId = () => Param('listingId', ParseUUIDPipe);
const ImageId = () => Param('imageId', ParseUUIDPipe);

@ApiTags('listing-images')
@ApiBearerAuth()
@Controller('me/listings/:listingId/images')
export class ListingImagesController {
  constructor(private readonly images: ListingImagesService) {}

  @Post('upload-request')
  requestUpload(
    @CurrentUser() user: AuthUser,
    @ListingId() listingId: string,
    @Body() dto: UploadRequestDto,
  ) {
    return this.images.requestUpload(listingId, user.id, dto);
  }

  @Post(':imageId/complete')
  @HttpCode(HttpStatus.OK)
  complete(
    @CurrentUser() user: AuthUser,
    @ListingId() listingId: string,
    @ImageId() imageId: string,
  ) {
    return this.images.complete(listingId, imageId, user.id);
  }

  @Post(':imageId/retry')
  @HttpCode(HttpStatus.OK)
  retry(
    @CurrentUser() user: AuthUser,
    @ListingId() listingId: string,
    @ImageId() imageId: string,
    @Body() dto: UploadRequestDto,
  ) {
    return this.images.retry(listingId, imageId, user.id, dto);
  }

  @Delete(':imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @CurrentUser() user: AuthUser,
    @ListingId() listingId: string,
    @ImageId() imageId: string,
  ) {
    await this.images.remove(listingId, imageId, user.id);
  }

  @Put('order')
  @HttpCode(HttpStatus.NO_CONTENT)
  async reorder(
    @CurrentUser() user: AuthUser,
    @ListingId() listingId: string,
    @Body() dto: ReorderImagesDto,
  ) {
    await this.images.reorder(listingId, user.id, dto.imageIds);
  }
}
