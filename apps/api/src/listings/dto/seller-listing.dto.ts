import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ListingStatus } from '../../generated/prisma/client';
import { PageQueryDto } from '../../common/pagination/page-query.dto';

export class CreateDraftDto {
  /** Category code, e.g. CARS. */
  @IsString()
  category: string;
}

export class UpdateListingDto {
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;

  /** Integer INR, greater than zero. */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1_000_000_000)
  price?: number;

  @IsOptional()
  @IsBoolean()
  isNegotiable?: boolean;

  @IsOptional()
  @IsUUID()
  districtId?: string;
}

export class MyListingsQueryDto extends PageQueryDto {
  @IsOptional()
  @IsEnum(ListingStatus)
  status?: ListingStatus;
}
