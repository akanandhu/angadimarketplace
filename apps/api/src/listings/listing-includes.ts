import { Prisma } from '../generated/prisma/client';

export const CAR_DETAILS_INCLUDE = {
  brand: true,
  model: true,
  variant: true,
} satisfies Prisma.CarDetailsInclude;

/** Everything the owner-facing editor needs. */
export const SELLER_LISTING_INCLUDE = {
  district: true,
  category: true,
  carDetails: { include: CAR_DETAILS_INCLUDE },
  images: { orderBy: { position: 'asc' } },
  stats: true,
} satisfies Prisma.ListingInclude;

export type SellerListing = Prisma.ListingGetPayload<{ include: typeof SELLER_LISTING_INCLUDE }>;
