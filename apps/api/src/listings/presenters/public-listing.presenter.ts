import { MediaUrlService } from '../../media/media-url.service';
import { PublicCardListing } from '../listing-includes';
import { presentPublicCar } from './car-details.presenter';

type PublicSeller = PublicCardListing['seller'];

export function presentPublicSeller(seller: PublicSeller, media: MediaUrlService) {
  const dealer = seller.accountType === 'DEALER' ? seller.dealerProfile : null;
  return {
    id: seller.id,
    type: dealer ? ('DEALER' as const) : ('INDIVIDUAL' as const),
    displayName: dealer?.businessName ?? seller.name ?? 'Angadi seller',
    dealerSlug: dealer?.slug ?? null,
    logoUrl: dealer ? media.image(dealer.logoKey, 'thumb') : null,
    district: seller.district,
    memberSince: seller.createdAt.toISOString(),
  };
}

/** Compact card used in search, favourites and dealer inventory. */
export function presentListingCard(
  listing: PublicCardListing,
  media: MediaUrlService,
  isSaved = false,
) {
  const car = listing.carDetails;
  const cover = listing.images[0];
  return {
    id: listing.id,
    slug: listing.slug,
    status: listing.status,
    title: listing.title,
    price: listing.price,
    isNegotiable: listing.isNegotiable,
    district: listing.district
      ? { name: listing.district.name, slug: listing.district.slug }
      : null,
    publishedAt: listing.publishedAt?.toISOString() ?? null,
    car: car
      ? {
          brand: car.brand.name,
          model: car.model.name,
          variant: car.variant?.name ?? car.variantText,
          manufacturingYear: car.manufacturingYear,
          kmDriven: car.kmDriven,
          fuelType: car.fuelType,
          transmission: car.transmission,
        }
      : null,
    coverImage: cover ? media.variants(cover.storageKey) : null,
    seller: presentPublicSeller(listing.seller, media),
    isSaved,
  };
}

/** Full public listing page. Never includes phone numbers or the full registration. */
export function presentListingDetail(
  listing: PublicCardListing,
  media: MediaUrlService,
  extras: { isSaved: boolean; isOwner: boolean; sellerActiveListings: number },
) {
  return {
    ...presentListingCard(listing, media, extras.isSaved),
    description: listing.description,
    images: listing.images.map((image) => ({
      id: image.id,
      width: image.width,
      height: image.height,
      urls: media.variants(image.storageKey),
    })),
    car: listing.carDetails ? presentPublicCar(listing.carDetails) : null,
    seller: {
      ...presentPublicSeller(listing.seller, media),
      activeListingCount: extras.sellerActiveListings,
    },
    isOwner: extras.isOwner,
  };
}
