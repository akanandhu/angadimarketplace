import { Injectable } from '@nestjs/common';
import { ListingStatus } from '../generated/prisma/client';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { PrismaService } from '../prisma/prisma.service';
import { SELLER_LISTING_INCLUDE, SellerListing } from './listing-includes';

@Injectable()
export class ListingAccessService {
  constructor(private readonly prisma: PrismaService) {}

  /** Loads a listing for its owner, optionally requiring one of the given statuses. */
  async findOwned(
    listingId: string,
    userId: string,
    allowed?: ListingStatus[],
  ): Promise<SellerListing> {
    const listing = await this.prisma.listing.findUnique({
      where: { id: listingId },
      include: SELLER_LISTING_INCLUDE,
    });
    if (!listing) throw AppException.notFound(ErrorCode.LISTING_NOT_FOUND, 'Listing not found');
    if (listing.sellerId !== userId) {
      throw AppException.forbidden(ErrorCode.LISTING_NOT_OWNER, 'You do not own this listing');
    }
    if (allowed && !allowed.includes(listing.status)) {
      throw AppException.conflict(
        ErrorCode.INVALID_LISTING_TRANSITION,
        `This action is not allowed for a ${listing.status.toLowerCase()} listing`,
        { status: listing.status },
      );
    }
    return listing;
  }
}
