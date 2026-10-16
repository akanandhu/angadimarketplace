import { IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class UpsertDealerProfileDto {
  @IsString()
  @Length(2, 80)
  businessName: string;

  @IsOptional()
  @IsUUID()
  districtId?: string;
}
