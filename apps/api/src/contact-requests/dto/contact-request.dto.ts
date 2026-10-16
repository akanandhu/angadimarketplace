import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { ContactRequestStatus, RejectionReason } from '../../generated/prisma/client';
import { PageQueryDto } from '../../common/pagination/page-query.dto';

export class CreateContactRequestDto {
  @IsUUID()
  listingId: string;

  /** "Allow this seller to contact me using my verified phone number." */
  @IsBoolean()
  allowSellerToContact: boolean;
}

export class RejectContactRequestDto {
  @IsEnum(RejectionReason)
  reason: RejectionReason;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string | null;
}

export class ContactRequestsQueryDto extends PageQueryDto {
  @IsOptional()
  @IsEnum(ContactRequestStatus)
  status?: ContactRequestStatus;
}

export class ContactStateQueryDto {
  @IsOptional()
  @IsUUID()
  listingId?: string;
}
