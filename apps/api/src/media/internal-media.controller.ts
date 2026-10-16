import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Public } from '../auth/decorators/public.decorator';
import { InternalSecretGuard } from '../common/http/internal-secret.guard';
import { ProcessingResultDto } from './dto/image.dto';
import { ListingImagesService } from './listing-images.service';
import { UserImagesService } from './user-images.service';

/** Callback target for the image processor (Lambda in AWS, BullMQ worker locally). */
@ApiExcludeController()
@Public()
@UseGuards(InternalSecretGuard)
@Controller('internal/media')
export class InternalMediaController {
  constructor(
    private readonly images: ListingImagesService,
    private readonly userImages: UserImagesService,
  ) {}

  @Post('images/:imageId/result')
  @HttpCode(HttpStatus.OK)
  async result(@Param('imageId', ParseUUIDPipe) imageId: string, @Body() dto: ProcessingResultDto) {
    const applied = await this.images.applyProcessingResult(imageId, dto);
    return { applied };
  }

  @Post('user-images/:imageId/result')
  @HttpCode(HttpStatus.OK)
  async userImageResult(
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Body() dto: ProcessingResultDto,
  ) {
    return { applied: await this.userImages.applyProcessingResult(imageId, dto) };
  }
}
