import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UploadRequestDto } from './dto/image.dto';
import { UserImagesService } from './user-images.service';

@ApiTags('user-images')
@ApiBearerAuth()
@Controller('me')
export class UserImagesController {
  constructor(private readonly images: UserImagesService) {}

  @Post('profile-image/upload-request')
  requestProfileImage(@CurrentUser() user: AuthUser, @Body() dto: UploadRequestDto) {
    return this.images.requestUpload(user.id, 'avatar', dto);
  }

  @Post('dealer-profile/logo/upload-request')
  requestLogo(@CurrentUser() user: AuthUser, @Body() dto: UploadRequestDto) {
    return this.images.requestUpload(user.id, 'logo', dto);
  }

  @Post('user-images/:imageId/complete')
  @HttpCode(HttpStatus.OK)
  complete(@CurrentUser() user: AuthUser, @Param('imageId', ParseUUIDPipe) imageId: string) {
    return this.images.complete(user.id, imageId);
  }

  /** Poll until READY; the new image then appears on /me. */
  @Get('user-images/:imageId')
  status(@CurrentUser() user: AuthUser, @Param('imageId', ParseUUIDPipe) imageId: string) {
    return this.images.status(user.id, imageId);
  }
}
