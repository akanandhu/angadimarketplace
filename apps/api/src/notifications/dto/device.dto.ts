import { IsEnum, IsString, Length } from 'class-validator';
import { DevicePlatform } from '../../generated/prisma/client';

export class RegisterDeviceDto {
  @IsEnum(DevicePlatform)
  platform: DevicePlatform;

  @IsString()
  @Length(1, 200)
  deviceIdentifier: string;

  @IsString()
  @Length(1, 4096)
  pushToken: string;
}
