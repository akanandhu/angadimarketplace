import { Injectable } from '@nestjs/common';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { PrismaService } from '../prisma/prisma.service';
import { hasPendingImages, MAX_IMAGES, missingSteps } from './domain/listing-readiness';
import { buildSearchText, buildSlug, buildTitle, ListingTextInput } from './domain/listing-text';
import { ListingAccessService } from './listing-access.service';
import { SellerListing } from './listing-includes';

@Injectable()
export class ListingPublisherService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ListingAccessService,
  ) {}

  /** Validates a draft and atomically makes it ACTIVE with derived title/slug/searchText. */
  async publish(listingId: string, userId: string): Promise<void> {
    const listing = await this.access.findOwned(listingId, userId);
    if (listing.status !== 'DRAFT') {
      throw AppException.conflict(ErrorCode.LISTING_NOT_DRAFT, 'Only drafts can be published');
    }

    const seller = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    const statuses = listing.images.map((image) => image.status);
    const missing = missingSteps({
      hasCarDetails: Boolean(listing.carDetails),
      price: listing.price,
      districtId: listing.districtId,
      imageStatuses: statuses,
      sellerName: seller.name,
    });
    if (missing.length) {
      throw AppException.unprocessable(
        ErrorCode.LISTING_NOT_READY,
        'Complete all required details before publishing',
        { missing },
      );
    }
    if (hasPendingImages(statuses)) {
      throw AppException.unprocessable(
        ErrorCode.IMAGE_NOT_READY,
        'Wait for your photos to finish processing',
      );
    }
    const readyCount = statuses.filter((status) => status === 'READY').length;
    if (readyCount > MAX_IMAGES) {
      throw AppException.unprocessable(ErrorCode.MAX_IMAGES_REACHED, 'Too many photos');
    }

    const text = this.textInput(listing);
    const { count } = await this.prisma.listing.updateMany({
      where: { id: listing.id, status: 'DRAFT' },
      data: {
        status: 'ACTIVE',
        publishedAt: new Date(),
        title: buildTitle(text),
        slug: buildSlug(text),
        searchText: buildSearchText(text),
      },
    });
    if (count === 0) {
      throw AppException.conflict(ErrorCode.LISTING_NOT_DRAFT, 'Listing was already published');
    }
  }

  /**
   * Keeps title/searchText in sync after an ACTIVE listing is edited.
   * The slug stays fixed so shared links keep working.
   */
  async refreshDerivedText(listingId: string, userId: string): Promise<void> {
    const listing = await this.access.findOwned(listingId, userId);
    if (listing.status === 'DRAFT' || !listing.carDetails || !listing.district) return;
    const text = this.textInput(listing);
    await this.prisma.listing.update({
      where: { id: listing.id },
      data: { title: buildTitle(text), searchText: buildSearchText(text) },
    });
  }

  private textInput(listing: SellerListing): ListingTextInput {
    const car = listing.carDetails!;
    return {
      listingId: listing.id,
      year: car.manufacturingYear,
      brand: car.brand.name,
      model: car.model.name,
      variant: car.variant?.name ?? car.variantText ?? '',
      fuelType: car.fuelType,
      transmission: car.transmission,
      district: listing.district!.name,
    };
  }
}
