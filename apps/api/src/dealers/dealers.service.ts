import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { slugify } from '../common/utils/slug';
import { MediaUrlService } from '../media/media-url.service';
import { PrismaService } from '../prisma/prisma.service';
import { SearchListingsDto } from '../search/dto/search-listings.dto';
import { SearchService } from '../search/search.service';
import { UsersService } from '../users/users.service';
import { UpsertDealerProfileDto } from './dealers.dto';

@Injectable()
export class DealersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly users: UsersService,
    private readonly search: SearchService,
    private readonly media: MediaUrlService,
  ) {}

  async getOwn(userId: string) {
    const profile = await this.prisma.dealerProfile.findUnique({
      where: { userId },
      include: { district: true },
    });
    if (!profile) return null;
    return {
      businessName: profile.businessName,
      slug: profile.slug,
      logoUrl: this.media.url(profile.logoKey),
      district: profile.district
        ? { id: profile.district.id, name: profile.district.name, slug: profile.district.slug }
        : null,
    };
  }

  /** Creating a dealer profile switches the account to DEALER. The slug never changes. */
  async upsertOwn(userId: string, dto: UpsertDealerProfileDto) {
    if (dto.districtId) await this.users.assertDistrict(dto.districtId);
    const businessName = dto.businessName.trim();
    const existing = await this.prisma.dealerProfile.findUnique({ where: { userId } });

    await this.prisma.$transaction([
      existing
        ? this.prisma.dealerProfile.update({
            where: { userId },
            data: { businessName, districtId: dto.districtId },
          })
        : this.prisma.dealerProfile.create({
            data: {
              userId,
              businessName,
              districtId: dto.districtId,
              slug: await this.uniqueSlug(businessName),
            },
          }),
      this.prisma.user.update({ where: { id: userId }, data: { accountType: 'DEALER' } }),
    ]);
    return this.getOwn(userId);
  }

  async getPublic(slug: string) {
    const profile = await this.findActiveDealer(slug);
    const activeListingCount = await this.prisma.listing.count({
      where: { sellerId: profile.userId, status: 'ACTIVE' },
    });
    return {
      sellerId: profile.userId,
      slug: profile.slug,
      businessName: profile.businessName,
      logoUrl: this.media.url(profile.logoKey),
      district: profile.district
        ? { name: profile.district.name, slug: profile.district.slug }
        : null,
      memberSince: profile.user.createdAt.toISOString(),
      activeListingCount,
    };
  }

  async listings(slug: string, query: SearchListingsDto, viewerId?: string) {
    const profile = await this.findActiveDealer(slug);
    return this.search.search(Object.assign(query, { sellerId: profile.userId }), viewerId);
  }

  private async findActiveDealer(slug: string) {
    const profile = await this.prisma.dealerProfile.findUnique({
      where: { slug },
      include: {
        district: true,
        user: { select: { createdAt: true, status: true, accountType: true } },
      },
    });
    if (!profile || profile.user.status !== 'ACTIVE' || profile.user.accountType !== 'DEALER') {
      throw AppException.notFound(ErrorCode.DEALER_NOT_FOUND, 'Dealer not found');
    }
    return profile;
  }

  private async uniqueSlug(businessName: string): Promise<string> {
    const base = slugify(businessName) || 'dealer';
    const taken = await this.prisma.dealerProfile.findUnique({ where: { slug: base } });
    return taken ? `${base}-${randomBytes(3).toString('hex')}` : base;
  }
}
