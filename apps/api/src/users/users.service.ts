import { Injectable } from '@nestjs/common';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { MediaUrlService } from '../media/media-url.service';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { ME_INCLUDE, MeView, presentMe } from './me.presenter';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaUrlService,
  ) {}

  /** Finds the user for a verified phone, creating the account on first login. */
  async findOrCreateByPhone(phone: string) {
    const existing = await this.prisma.user.findUnique({ where: { phone } });
    if (existing) return { user: existing, isNewUser: false };
    const user = await this.prisma.user.upsert({ where: { phone }, update: {}, create: { phone } });
    return { user, isNewUser: true };
  }

  async getMe(userId: string): Promise<MeView> {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, include: ME_INCLUDE });
    if (!user) throw AppException.notFound(ErrorCode.USER_NOT_FOUND, 'User not found');
    return presentMe(user, this.media);
  }

  async updateMe(userId: string, dto: UpdateMeDto): Promise<MeView> {
    if (dto.districtId) await this.assertDistrict(dto.districtId);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        name: dto.name?.trim(),
        districtId: dto.districtId,
        accountType: dto.accountType,
        defaultAllowSellerContact: dto.defaultAllowSellerContact,
      },
    });
    return this.getMe(userId);
  }

  async assertDistrict(districtId: string) {
    const district = await this.prisma.district.findUnique({ where: { id: districtId } });
    if (!district) throw AppException.notFound(ErrorCode.DISTRICT_NOT_FOUND, 'Unknown district');
    return district;
  }
}
