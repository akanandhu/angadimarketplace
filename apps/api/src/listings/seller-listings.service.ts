import { Injectable } from '@nestjs/common';
import { AnalyticsService } from '../analytics/analytics.service';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { Paginated } from '../common/pagination/paginated';
import { MediaUrlService } from '../media/media-url.service';
import { MediaCleanupService } from '../media/storage/media-cleanup.service';
import { PrismaService } from '../prisma/prisma.service';
import { MyListingsQueryDto, UpdateListingDto } from './dto/seller-listing.dto';
import { ListingAccessService } from './listing-access.service';
import { SELLER_LISTING_INCLUDE } from './listing-includes';
import { ListingPublisherService } from './listing-publisher.service';
import {
  presentSellerListing,
  presentStats,
  SellerListingView,
} from './presenters/seller-listing.presenter';

@Injectable()
export class SellerListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ListingAccessService,
    private readonly publisher: ListingPublisherService,
    private readonly media: MediaUrlService,
    private readonly cleanup: MediaCleanupService,
    private readonly analytics: AnalyticsService,
  ) {}

  async createDraft(userId: string, categoryCode: string): Promise<SellerListingView> {
    const category = await this.prisma.category.findUnique({
      where: { code: categoryCode.toUpperCase() },
    });
    if (!category?.isActive) {
      throw AppException.notFound(ErrorCode.CATEGORY_NOT_FOUND, 'Unknown category');
    }
    const seller = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const listing = await this.prisma.listing.create({
      data: {
        sellerId: userId,
        categoryId: category.id,
        // Pre-fill the seller's home district to save a step.
        districtId: seller.districtId,
        stats: { create: {} },
      },
    });
    return this.get(listing.id, userId);
  }

  async list(userId: string, query: MyListingsQueryDto): Promise<Paginated<SellerListingView>> {
    const where = { sellerId: userId, ...(query.status ? { status: query.status } : {}) };
    const [seller, total, listings] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        include: SELLER_LISTING_INCLUDE,
        orderBy: { updatedAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
    ]);
    return Paginated.of(
      listings.map((listing) => presentSellerListing(listing, seller.name, this.media)),
      total,
      query.page,
      query.limit,
    );
  }

  async get(listingId: string, userId: string): Promise<SellerListingView> {
    const [listing, seller] = await Promise.all([
      this.access.findOwned(listingId, userId),
      this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
    ]);
    return presentSellerListing(listing, seller.name, this.media);
  }

  async update(listingId: string, userId: string, dto: UpdateListingDto) {
    await this.access.findOwned(listingId, userId, ['DRAFT', 'ACTIVE']);
    if (dto.districtId) {
      const district = await this.prisma.district.findUnique({ where: { id: dto.districtId } });
      if (!district) throw AppException.notFound(ErrorCode.DISTRICT_NOT_FOUND, 'Unknown district');
    }
    await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        description: dto.description?.trim(),
        price: dto.price,
        isNegotiable: dto.isNegotiable,
        districtId: dto.districtId,
      },
    });
    if (dto.districtId) await this.publisher.refreshDerivedText(listingId, userId);
    return this.get(listingId, userId);
  }

  async markSold(listingId: string, userId: string) {
    await this.access.findOwned(listingId, userId, ['ACTIVE']);
    await this.prisma.listing.update({
      where: { id: listingId },
      data: { status: 'SOLD', soldAt: new Date() },
    });
    this.analytics.capture(userId, 'listing_marked_sold', { listingId });
    return this.get(listingId, userId);
  }

  /** Seller-initiated removal. The record and its history are preserved. */
  async remove(listingId: string, userId: string) {
    await this.access.findOwned(listingId, userId, ['ACTIVE', 'SOLD']);
    await this.prisma.listing.update({
      where: { id: listingId },
      data: { status: 'REMOVED', removedAt: new Date(), removedByAdmin: false },
    });
    return this.get(listingId, userId);
  }

  /** Drafts were never public, so they can be deleted outright. */
  async deleteDraft(listingId: string, userId: string): Promise<void> {
    await this.access.findOwned(listingId, userId, ['DRAFT']);
    await this.prisma.listing.delete({ where: { id: listingId } });
    await this.cleanup.deletePrefix(`listings/${listingId}/`);
  }

  async stats(listingId: string, userId: string) {
    const listing = await this.access.findOwned(listingId, userId);
    return presentStats(listing.stats);
  }
}
