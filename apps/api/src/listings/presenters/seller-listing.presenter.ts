import { MediaUrlService } from '../../media/media-url.service';
import { hasPendingImages, missingSteps } from '../domain/listing-readiness';
import { SellerListing } from '../listing-includes';
import { presentOwnerCar } from './car-details.presenter';
import { presentOwnerImage, readyImages } from './image.presenter';

export function presentStats(stats: SellerListing['stats']) {
  return {
    views: stats?.viewCount ?? 0,
    favourites: stats?.favouriteCount ?? 0,
    contactRequests: stats?.contactRequestCount ?? 0,
    contactApprovals: stats?.contactApprovalCount ?? 0,
  };
}

/** Owner-facing listing, including draft progress and media processing state. */
export function presentSellerListing(
  listing: SellerListing,
  sellerName: string | null,
  media: MediaUrlService,
) {
  const statuses = listing.images.map((image) => image.status);
  const cover = readyImages(listing.images)[0];
  return {
    id: listing.id,
    status: listing.status,
    category: listing.category.code,
    title: listing.title,
    slug: listing.slug,
    description: listing.description,
    price: listing.price,
    isNegotiable: listing.isNegotiable,
    district: listing.district
      ? { id: listing.district.id, name: listing.district.name, slug: listing.district.slug }
      : null,
    car: listing.carDetails ? presentOwnerCar(listing.carDetails) : null,
    coverImage: cover ? media.variants(cover.storageKey) : null,
    images: listing.images.map((image, index) => presentOwnerImage(image, index, media)),
    stats: presentStats(listing.stats),
    missingSteps: missingSteps({
      hasCarDetails: Boolean(listing.carDetails),
      price: listing.price,
      districtId: listing.districtId,
      imageStatuses: statuses,
      sellerName,
    }),
    hasPendingImages: hasPendingImages(statuses),
    removedByAdmin: listing.removedByAdmin,
    removalReason: listing.removalReason,
    publishedAt: listing.publishedAt?.toISOString() ?? null,
    soldAt: listing.soldAt?.toISOString() ?? null,
    removedAt: listing.removedAt?.toISOString() ?? null,
    createdAt: listing.createdAt.toISOString(),
    updatedAt: listing.updatedAt.toISOString(),
  };
}

export type SellerListingView = ReturnType<typeof presentSellerListing>;
