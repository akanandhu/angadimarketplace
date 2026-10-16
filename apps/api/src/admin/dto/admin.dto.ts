import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ListingStatus, ReportStatus, UserStatus } from '../../generated/prisma/client';
import { PageQueryDto } from '../../common/pagination/page-query.dto';

export class AdminListingsQueryDto extends PageQueryDto {
  @IsOptional() @IsEnum(ListingStatus) status?: ListingStatus;
  /** Matches title or slug. */
  @IsOptional() @IsString() @MaxLength(100) q?: string;
}

export class AdminUsersQueryDto extends PageQueryDto {
  @IsOptional() @IsEnum(UserStatus) status?: UserStatus;
  /** Matches name or phone. */
  @IsOptional() @IsString() @MaxLength(100) q?: string;
}

export class AdminReportsQueryDto extends PageQueryDto {
  @IsOptional() @IsEnum(ReportStatus) status?: ReportStatus;
}

export class ModerationNoteDto {
  @IsOptional() @IsString() @MaxLength(500) note?: string;
}
