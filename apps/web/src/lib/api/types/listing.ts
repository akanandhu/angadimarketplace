import type {
  AccidentHistory,
  DistrictRef,
  FuelType,
  ImageStatus,
  ImageUrls,
  InsuranceType,
  ListingStatus,
  Transmission,
} from './common';

export interface PublicSeller {
  id: string;
  type: 'INDIVIDUAL' | 'DEALER';
  displayName: string;
  dealerSlug: string | null;
  logoUrl: string | null;
  district: DistrictRef | null;
  memberSince: string;
  activeListingCount?: number;
}

export interface ListingCard {
  id: string;
  slug: string;
  status: ListingStatus;
  title: string;
  price: number;
  isNegotiable: boolean;
  district: DistrictRef | null;
  publishedAt: string | null;
  car: {
    brand: string;
    model: string;
    variant: string | null;
    manufacturingYear: number;
    kmDriven: number;
    fuelType: FuelType;
    transmission: Transmission;
  } | null;
  coverImage: ImageUrls | null;
  seller: PublicSeller;
  isSaved: boolean;
}

export interface PublicCar {
  brand: { id: string; name: string; slug: string };
  model: { id: string; name: string; slug: string };
  variant: string | null;
  variantId: string | null;
  manufacturingYear: number;
  fuelType: FuelType;
  transmission: Transmission;
  kmDriven: number;
  numberOfOwners: number;
  rtoCode: string;
  rtoDisplay: string;
  accidentHistory: AccidentHistory | null;
  hasMajorReplacement: boolean | null;
  replacementDetails: string | null;
  colour: string | null;
  insuranceType: InsuranceType | null;
  insuranceValidUntil: string | null;
}

export interface ListingDetail extends Omit<ListingCard, 'car'> {
  description: string | null;
  images: { id: string; width: number | null; height: number | null; urls: ImageUrls }[];
  car: PublicCar | null;
  seller: PublicSeller & { activeListingCount: number };
  isOwner: boolean;
}

/** 410 details for sold/removed listings. */
export interface UnavailableListing {
  status: 'SOLD' | 'UNAVAILABLE';
  brandSlug: string | null;
  modelSlug: string | null;
  districtSlug: string | null;
}

export interface OwnerImage {
  id: string;
  status: ImageStatus;
  position: number;
  isCover: boolean;
  urls: ImageUrls | null;
  failureReason: string | null;
}

export interface ListingStats {
  views: number;
  favourites: number;
  contactRequests: number;
  contactApprovals: number;
}

export type ListingStep = 'vehicle' | 'price' | 'district' | 'photos' | 'profile';

export interface SellerListing {
  id: string;
  status: ListingStatus;
  category: string;
  title: string | null;
  slug: string | null;
  description: string | null;
  price: number | null;
  isNegotiable: boolean;
  district: { id: string; name: string; slug: string } | null;
  car: (PublicCar & { variantText: string | null; registrationNumber: string }) | null;
  coverImage: ImageUrls | null;
  images: OwnerImage[];
  stats: ListingStats;
  missingSteps: ListingStep[];
  hasPendingImages: boolean;
  removedByAdmin: boolean;
  removalReason: string | null;
  publishedAt: string | null;
  soldAt: string | null;
  removedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FavouriteItem {
  savedAt: string;
  isAvailable: boolean;
  listing: ListingCard;
}
