import { Prisma } from '../generated/prisma/client';
import { contactDetails, ContactDetails } from '../contact-connections/contact-details';
import { PUBLIC_SELLER_SELECT } from '../listings/listing-includes';
import { presentPublicSeller } from '../listings/presenters/public-listing.presenter';
import { MediaUrlService } from '../media/media-url.service';
import { activeCooldownUntil } from './domain/cooldown';

export const REQUEST_INCLUDE = {
  buyer: { select: { ...PUBLIC_SELLER_SELECT, phone: true } },
  seller: { select: PUBLIC_SELLER_SELECT },
  sourceListing: {
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      status: true,
      images: {
        where: { status: 'READY' },
        orderBy: { position: 'asc' },
        take: 1,
        select: { storageKey: true },
      },
    },
  },
} satisfies Prisma.ContactRequestInclude;

type RequestRow = Prisma.ContactRequestGetPayload<{ include: typeof REQUEST_INCLUDE }>;

function base(request: RequestRow, media: MediaUrlService) {
  const listing = request.sourceListing;
  const cover = listing.images[0];
  return {
    id: request.id,
    status: request.status,
    listing: {
      id: listing.id,
      slug: listing.slug,
      title: listing.title,
      price: listing.price,
      status: listing.status,
      thumbnailUrl: cover ? media.variant(cover.storageKey, 'thumb') : null,
    },
    rejectionReason: request.rejectionReason,
    createdAt: request.createdAt.toISOString(),
    respondedAt: request.respondedAt?.toISOString() ?? null,
  };
}

/**
 * Seller's view. The buyer's phone appears only if the buyer allowed it, and only
 * while the request is pending or approved.
 */
export function presentIncoming(request: RequestRow, media: MediaUrlService) {
  const sharePhone =
    request.allowSellerToContact && (request.status === 'PENDING' || request.status === 'APPROVED');
  return {
    ...base(request, media),
    rejectionNote: request.rejectionNote,
    buyer: {
      id: request.buyer.id,
      name: request.buyer.name ?? 'Angadi user',
      district: request.buyer.district,
      memberSince: request.buyer.createdAt.toISOString(),
    },
    buyerAllowedContact: request.allowSellerToContact,
    buyerContact: sharePhone ? contactDetails(request.buyer.phone) : null,
  };
}

/** Buyer's view. Seller contact is attached only when a Buyer -> Seller connection exists. */
export function presentOutgoing(
  request: RequestRow,
  media: MediaUrlService,
  sellerContact: ContactDetails | null,
) {
  const cooldownUntil = activeCooldownUntil(request);
  return {
    ...base(request, media),
    allowSellerToContact: request.allowSellerToContact,
    seller: presentPublicSeller(request.seller, media),
    isConnected: Boolean(sellerContact),
    sellerContact,
    canRequestAgainAt: cooldownUntil?.toISOString() ?? null,
    canRequestAgain:
      request.status !== 'PENDING' &&
      request.status !== 'APPROVED' &&
      !cooldownUntil &&
      !sellerContact &&
      request.sourceListing.status === 'ACTIVE',
  };
}
