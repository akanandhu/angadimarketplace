import { IsEnum, IsOptional, IsString, IsUUID, Length, Matches } from 'class-validator';
import { ClientType } from '../../generated/prisma/client';

export class RequestOtpDto {
  /** Indian mobile number, e.g. +919876543210. */
  @IsString()
  @Length(10, 16)
  phone: string;
}

export class VerifyOtpDto {
  @IsUUID()
  requestId: string;

  @Matches(/^\d{6}$/, { message: 'otp must be 6 digits' })
  otp: string;

  @IsEnum(ClientType)
  clientType: ClientType;
}

export class RefreshDto {
  /** Mobile clients send the token from secure storage; web relies on the cookie. */
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
