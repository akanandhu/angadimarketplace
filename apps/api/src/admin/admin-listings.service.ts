import { Injectable } from '@nestjs/common';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { Paginated } from '../common/pagination/paginated';
import { SELLER_LISTING_INCLUDE } from '../listings/listing-includes';
import { presentSellerListing } from '../listings/presenters/seller-listing.presenter';
import { MediaUrlService } from '../media/media-url.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminListingsQueryDto } from './dto/admin.dto';

const SELLER = { select: { id: true, name: true, phone: true, status: true, accountType: true } };

@Injectable()
export class AdminListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaUrlService,
    private readonly notifications: NotificationsService,
  ) {}

  async list(query: AdminListingsQueryDto) {
    const where = {
      status: query.status ?? { not: 'DRAFT' as const },
      ...(query.q
        ? {
            OR: [
              { title: { contains: query.q, mode: 'insensitive' as const } },
              { slug: { contains: query.q.toLowerCase() } },
            ],
          }
        : {}),
    };
    const [total, rows] = await Promise.all([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        include: {
          seller: SELLER,
          district: true,
          _count: { select: { reports: { where: { status: 'OPEN' } } } },
        },
        orderBy: { updatedAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
    ]);
    return Paginated.of(
      rows.map((row) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        status: row.status,
        price: row.price,
        district: row.district?.name ?? null,
        seller: row.seller,
        openReports: row._count.reports,
        removedByAdmin: row.removedByAdmin,
        publishedAt: row.publishedAt?.toISOString() ?? null,
      })),
      total,
      query.page,
      query.limit,
    );
  }

  async get(listingId: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        ...SELLER_LISTING_INCLUDE,
        seller: SELLER,
        reports: { orderBy: { createdAt: 'desc' }, include: { reporter: SELLER } },
      },
    });
    if (!listing) throw AppException.notFound(ErrorCode.LISTING_NOT_FOUND, 'Listing not found');
    return {
      ...presentSellerListing(listing, listing.seller.name, this.media),
      seller: listing.seller,
      reports: listing.reports.map((report) => ({
        id: report.id,
        reason: report.reason,
        details: report.details,
        status: report.status,
        reporter: report.reporter,
        createdAt: report.createdAt.toISOString(),
      })),
    };
  }

  async remove(listingId: string, note?: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw AppException.notFound(ErrorCode.LISTING_NOT_FOUND, 'Listing not found');
    if (listing.status === 'DRAFT' || (listing.status === 'REMOVED' && listing.removedByAdmin)) {
      throw AppException.conflict(
        ErrorCode.INVALID_LISTING_TRANSITION,
        'Listing cannot be removed',
      );
    }
    await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        status: 'REMOVED',
        removedAt: new Date(),
        removedByAdmin: true,
        removalReason: note?.trim() || 'Removed by Angadi moderation',
      },
    });
    await this.notifications.notify([
      {
        userId: listing.sellerId,
        type: 'LISTING_REMOVED_BY_ADMIN',
        title: 'Listing removed',
        body: `Your listing ${listing.title ?? ''} was removed by Angadi moderation.`.trim(),
        data: { listingId },
      },
    ]);
    return this.get(listingId);
  }

  /** Restores an admin-removed listing to its pre-removal public state. */
  async restore(listingId: string) {
    const listing = await this.prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) throw AppException.notFound(ErrorCode.LISTING_NOT_FOUND, 'Listing not found');
    if (listing.status !== 'REMOVED' || !listing.removedByAdmin) {
      throw AppException.conflict(
        ErrorCode.INVALID_LISTING_TRANSITION,
        'Only listings removed by moderation can be restored',
      );
    }
    await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        status: listing.soldAt ? 'SOLD' : 'ACTIVE',
        removedAt: null,
        removedByAdmin: false,
        removalReason: null,
      },
    });
    await this.notifications.notify([
      {
        userId: listing.sellerId,
        type: 'LISTING_RESTORED_BY_ADMIN',
        title: 'Listing restored',
        body: `Your listing ${listing.title ?? ''} is visible again.`.trim(),
        data: { listingId },
      },
    ]);
    return this.get(listingId);
  }
}
