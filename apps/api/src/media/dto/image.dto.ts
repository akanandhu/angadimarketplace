import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from '../image-rules';
import { MAX_IMAGES } from '../../listings/domain/listing-readiness';

export class UploadRequestDto {
  @IsString()
  @MaxLength(200)
  fileName: string;

  @IsIn(ALLOWED_IMAGE_TYPES)
  mimeType: string;

  @IsInt()
  @Min(1)
  @Max(MAX_IMAGE_BYTES)
  sizeBytes: number;
}

export class ReorderImagesDto {
  /** Full ordered list of the listing's image IDs. The first is the cover. */
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_IMAGES)
  @IsUUID('all', { each: true })
  imageIds: string[];
}

export class ProcessingResultDto {
  @IsIn(['READY', 'FAILED'])
  status: 'READY' | 'FAILED';

  @IsOptional()
  @IsInt()
  width?: number;

  @IsOptional()
  @IsInt()
  height?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  failureReason?: string;
}
