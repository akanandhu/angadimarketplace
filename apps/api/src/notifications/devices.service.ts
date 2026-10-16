import { Injectable } from '@nestjs/common';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDeviceDto } from './dto/device.dto';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Upserts the device; a push token can only belong to one account at a time. */
  async register(userId: string, dto: RegisterDeviceDto) {
    const device = await this.prisma.$transaction(async (tx) => {
      await tx.userDevice.deleteMany({
        where: { pushToken: dto.pushToken, NOT: { userId } },
      });
      return tx.userDevice.upsert({
        where: { userId_deviceIdentifier: { userId, deviceIdentifier: dto.deviceIdentifier } },
        create: { userId, ...dto },
        update: { platform: dto.platform, pushToken: dto.pushToken, lastSeenAt: new Date() },
      });
    });
    // Push tokens are never echoed back.
    return { id: device.id, platform: device.platform, deviceIdentifier: device.deviceIdentifier };
  }

  async remove(userId: string, deviceId: string): Promise<void> {
    const { count } = await this.prisma.userDevice.deleteMany({ where: { id: deviceId, userId } });
    if (!count) throw AppException.notFound(ErrorCode.DEVICE_NOT_FOUND, 'Device not found');
  }
}
