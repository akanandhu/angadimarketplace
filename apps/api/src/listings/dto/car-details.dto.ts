import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  AccidentHistory,
  FuelType,
  InsuranceType,
  Transmission,
} from '../../generated/prisma/client';

const CURRENT_YEAR = new Date().getUTCFullYear();

export class CarDetailsDto {
  @IsUUID()
  brandId: string;

  @IsUUID()
  modelId: string;

  /** Catalogue variant. Either this or variantText is required. */
  @IsOptional()
  @IsUUID()
  variantId?: string | null;

  /** Free-text fallback when the catalogue lacks the variant. */
  @IsOptional()
  @IsString()
  @Length(1, 80)
  variantText?: string | null;

  @IsInt()
  @Min(1980)
  @Max(CURRENT_YEAR + 1)
  manufacturingYear: number;

  @IsEnum(FuelType)
  fuelType: FuelType;

  @IsEnum(Transmission)
  transmission: Transmission;

  @IsInt()
  @Min(0)
  @Max(2_000_000)
  kmDriven: number;

  @IsInt()
  @Min(1)
  @Max(10)
  numberOfOwners: number;

  @IsString()
  @Length(4, 20)
  registrationNumber: string;

  @IsOptional()
  @IsEnum(AccidentHistory)
  accidentHistory?: AccidentHistory | null;

  @IsOptional()
  @IsBoolean()
  hasMajorReplacement?: boolean | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  replacementDetails?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  colour?: string | null;

  @IsOptional()
  @IsEnum(InsuranceType)
  insuranceType?: InsuranceType | null;

  @IsOptional()
  @IsDateString()
  insuranceValidUntil?: string | null;
}
