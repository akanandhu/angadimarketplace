import { Transform, Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';
import { FuelType, Transmission } from '../../generated/prisma/client';
import { PageQueryDto } from '../../common/pagination/page-query.dto';

export const SORTS = ['newest', 'price_asc', 'price_desc', 'km_asc'] as const;
export type ListingSort = (typeof SORTS)[number];

const csv = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.split(',').filter(Boolean) : value;

const Int = () => (target: object, key: string) => {
  Type(() => Number)(target, key);
  IsInt()(target, key);
  Min(0)(target, key);
  IsOptional()(target, key);
};

export class SearchListingsDto extends PageQueryDto {
  /** Category code. V1: CARS. */
  @IsOptional() @IsString() category: string = 'CARS';

  /** Free text such as "Swift", "Honda City" or "creta diesel". */
  @IsOptional() @IsString() @MaxLength(100) q?: string;

  @IsOptional() @IsUUID() districtId?: string;
  @IsOptional() @IsString() districtSlug?: string;
  @IsOptional() @IsUUID() brandId?: string;
  @IsOptional() @IsString() brandSlug?: string;
  @IsOptional() @IsUUID() modelId?: string;
  @IsOptional() @IsString() modelSlug?: string;
  @IsOptional() @IsUUID() variantId?: string;
  @IsOptional() @IsUUID() sellerId?: string;
  /** Excludes one listing, e.g. the one being viewed in "similar cars". */
  @IsOptional() @IsUUID() excludeListingId?: string;

  @Int() minPrice?: number;
  @Int() maxPrice?: number;
  @Int() minYear?: number;
  @Int() maxYear?: number;
  @Int() minKm?: number;
  @Int() maxKm?: number;
  /** Maximum number of previous owners (1 = first owner only). */
  @Int() numberOfOwners?: number;

  /** Comma-separated, e.g. PETROL,DIESEL. */
  @IsOptional() @Transform(csv) @IsEnum(FuelType, { each: true }) fuelType?: FuelType[];

  /** Comma-separated, e.g. AUTOMATIC. */
  @IsOptional()
  @Transform(csv)
  @IsEnum(Transmission, { each: true })
  transmission?: Transmission[];

  @IsOptional() @IsIn(SORTS) sort: ListingSort = 'newest';
}
