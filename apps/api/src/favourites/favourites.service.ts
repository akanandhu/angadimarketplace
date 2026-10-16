import { Injectable } from '@nestjs/common';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { PageQueryDto } from '../common/pagination/page-query.dto';
import { Paginated } from '../common/pagination/paginated';
import { PUBLIC_CARD_INCLUDE } from '../listings/listing-includes';
import { presentListingCard } from '../listings/presenters/public-listing.presenter';
import { MediaUrlService } from '../media/media-url.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavouritesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaUrlService,
  ) {}

  /** Includes sold/removed listings so the history stays visible with an unavailable state. */
  async list(userId: string, query: PageQueryDto) {
    const where = { userId, listing: { status: { not: 'DRAFT' as const } } };
    const [total, favourites] = await Promise.all([
      this.prisma.favourite.count({ where }),
      this.prisma.favourite.findMany({
        where,
        include: { listing: { include: PUBLIC_CARD_INCLUDE } },
        orderBy: { createdAt: 'desc' },
        skip: query.skip,
        take: query.limit,
      }),
    ]);
    return Paginated.of(
      favourites.map((favourite) => ({
        savedAt: favourite.createdAt.toISOString(),
        isAvailable: favourite.listing.status === 'ACTIVE',
        listing: presentListingCard(favourite.listing, this.media, true),
      })),
      total,
      query.page,
      query.limit,
    );
  }

  /** Idempotent save; the counter only moves when a row is actually created. */
  async save(userId: string, listingId: string): Promise<void> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      select: { status: true },
    });
    if (!listing) throw AppException.notFound(ErrorCode.LISTING_NOT_FOUND, 'Listing not found');

    await this.prisma.$transaction(async (tx) => {
      const existing = await tx.favourite.findUnique({
        where: { userId_listingId: { userId, listingId } },
      });
      if (existing) return;
      if (listing.status !== 'ACTIVE') {
        throw AppException.conflict(
          ErrorCode.LISTING_NOT_ACTIVE,
          'This car is no longer available',
        );
      }
      const { count } = await tx.favourite.createMany({
        data: [{ userId, listingId }],
        skipDuplicates: true,
      });
      if (count) {
        await tx.listingStats.updateMany({
          where: { listingId },
          data: { favouriteCount: { increment: 1 } },
        });
      }
    });
  }

  async remove(userId: string, listingId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.favourite.deleteMany({ where: { userId, listingId } });
      if (count) {
        await tx.listingStats.updateMany({
          where: { listingId, favouriteCount: { gt: 0 } },
          data: { favouriteCount: { decrement: 1 } },
        });
      }
    });
  }
}
