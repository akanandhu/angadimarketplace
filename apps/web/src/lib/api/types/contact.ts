import type { ListingStatus } from './common';
import type { PublicSeller } from './listing';

export type ContactRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type RejectionReason =
  'NO_LONGER_AVAILABLE' | 'NOT_COMFORTABLE_SHARING' | 'SUSPECTED_SPAM' | 'OTHER';

export interface ContactDetails {
  phone: string;
  whatsappUrl: string;
}

interface RequestBase {
  id: string;
  status: ContactRequestStatus;
  listing: {
    id: string;
    slug: string | null;
    title: string | null;
    price: number | null;
    status: ListingStatus;
    thumbnailUrl: string | null;
  };
  rejectionReason: RejectionReason | null;
  createdAt: string;
  respondedAt: string | null;
}

export interface IncomingRequest extends RequestBase {
  rejectionNote: string | null;
  buyer: {
    id: string;
    name: string;
    district: { name: string; slug: string } | null;
    memberSince: string;
  };
  buyerAllowedContact: boolean;
  buyerContact: ContactDetails | null;
}

export interface OutgoingRequest extends RequestBase {
  allowSellerToContact: boolean;
  seller: PublicSeller;
  isConnected: boolean;
  sellerContact: ContactDetails | null;
  canRequestAgainAt: string | null;
  canRequestAgain: boolean;
}

export type ContactState =
  | { state: 'OWN' }
  | { state: 'CONNECTED'; connectionId: string; sellerContact: ContactDetails }
  | {
      state: 'NOT_CONNECTED';
      canRequest: boolean;
      listingRequest: {
        id: string;
        status: ContactRequestStatus;
        rejectionReason: RejectionReason | null;
        createdAt: string;
        canRequestAgainAt: string | null;
      } | null;
    };

export interface ContactConnection {
  id: string;
  role: 'buyer' | 'seller';
  counterpart: PublicSeller;
  contact: ContactDetails | null;
  sellerCanContactBuyer: boolean;
  createdAt: string;
}
