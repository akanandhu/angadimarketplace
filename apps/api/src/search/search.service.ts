import { HttpStatus, Injectable } from '@nestjs/common';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { Paginated } from '../common/pagination/paginated';
import { PUBLIC_CARD_INCLUDE, PUBLIC_DETAIL_INCLUDE } from '../listings/listing-includes';
import {
  presentListingCard,
  presentListingDetail,
} from '../listings/presenters/public-listing.presenter';
import { MediaUrlService } from '../media/media-url.service';
import { PrismaService } from '../prisma/prisma.service';
import { SearchListingsDto } from './dto/search-listings.dto';
import { buildListingOrder, buildListingWhere } from './listing-filters';
import { matchListingIds } from './text-search';

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaUrlService,
  ) {}

  async search(query: SearchListingsDto, viewerId?: string) {
    const textIds = query.q?.trim() ? await matchListingIds(this.prisma, query.q) : undefined;
    if (textIds && textIds.length === 0) return Paginated.of([], 0, query.page, query.limit);

    const where = buildListingWhere(query, textIds);
    const [total, listings] = await Promise.all([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        include: PUBLIC_CARD_INCLUDE,
        orderBy: buildListingOrder(query.sort),
        skip: query.skip,
        take: query.limit,
      }),
    ]);
    const saved = await this.savedIds(
      viewerId,
      listings.map((listing) => listing.id),
    );
    return Paginated.of(
      listings.map((listing) => presentListingCard(listing, this.media, saved.has(listing.id))),
      total,
      query.page,
      query.limit,
    );
  }

  async detail(slug: string, viewerId?: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { slug },
      include: PUBLIC_DETAIL_INCLUDE,
    });
    if (!listing) throw AppException.notFound(ErrorCode.LISTING_NOT_FOUND, 'Listing not found');

    if (listing.status !== 'ACTIVE' || listing.seller.status !== 'ACTIVE') {
      // Old/shared links get a clear "no longer available" state, never private details.
      throw new AppException(
        ErrorCode.LISTING_NOT_ACTIVE,
        'This car is no longer available',
        HttpStatus.GONE,
        {
          status: listing.status === 'SOLD' ? 'SOLD' : 'UNAVAILABLE',
          brandSlug: listing.carDetails?.brand.slug ?? null,
          modelSlug: listing.carDetails?.model.slug ?? null,
          districtSlug: listing.district?.slug ?? null,
        },
      );
    }

    const [saved, sellerActiveListings] = await Promise.all([
      this.savedIds(viewerId, [listing.id]),
      this.prisma.listing.count({ where: { sellerId: listing.sellerId, status: 'ACTIVE' } }),
    ]);
    return presentListingDetail(listing, this.media, {
      isSaved: saved.has(listing.id),
      isOwner: viewerId === listing.sellerId,
      sellerActiveListings,
    });
  }

  /** Active listing slugs for the dynamic sitemap. */
  async sitemap(page: number, limit: number) {
    const where = { status: 'ACTIVE' as const, slug: { not: null } };
    const [total, rows] = await Promise.all([
      this.prisma.listing.count({ where }),
      this.prisma.listing.findMany({
        where,
        select: { slug: true, updatedAt: true },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);
    return Paginated.of(
      rows.map((row) => ({ slug: row.slug!, updatedAt: row.updatedAt.toISOString() })),
      total,
      page,
      limit,
    );
  }

  private async savedIds(userId: string | undefined, listingIds: string[]): Promise<Set<string>> {
    if (!userId || !listingIds.length) return new Set();
    const rows = await this.prisma.favourite.findMany({
      where: { userId, listingId: { in: listingIds } },
      select: { listingId: true },
    });
    return new Set(rows.map((row) => row.listingId));
  }
}
