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

/** Public seller identity only — no phone, no private fields. */
export const PUBLIC_SELLER_SELECT = {
  id: true,
  name: true,
  accountType: true,
  createdAt: true,
  district: { select: { name: true, slug: true } },
  dealerProfile: { select: { businessName: true, slug: true, logoKey: true } },
} satisfies Prisma.UserSelect;

/** Listing card: cover image only. */
export const PUBLIC_CARD_INCLUDE = {
  district: true,
  carDetails: { include: CAR_DETAILS_INCLUDE },
  images: { where: { status: 'READY' }, orderBy: { position: 'asc' }, take: 1 },
  seller: { select: PUBLIC_SELLER_SELECT },
} satisfies Prisma.ListingInclude;

export const PUBLIC_DETAIL_INCLUDE = {
  ...PUBLIC_CARD_INCLUDE,
  images: { where: { status: 'READY' }, orderBy: { position: 'asc' } },
} satisfies Prisma.ListingInclude;

export type PublicCardListing = Prisma.ListingGetPayload<{ include: typeof PUBLIC_CARD_INCLUDE }>;
