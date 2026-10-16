import type { AccountType } from './common';

export interface Me {
  id: string;
  name: string | null;
  phone: string;
  phoneVerified: boolean;
  accountType: AccountType;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED';
  district: { id: string; name: string; slug: string } | null;
  profileImageUrl: string | null;
  defaultAllowSellerContact: boolean;
  memberSince: string;
  isProfileComplete: boolean;
  dealerProfile: {
    businessName: string;
    slug: string;
    logoUrl: string | null;
    districtId: string | null;
  } | null;
}

export interface Session {
  accessToken: string;
  accessTokenExpiresAt: string;
  /** Only returned to mobile clients; web uses an HTTP-only cookie. */
  refreshToken?: string;
}

export interface VerifyOtpResult extends Session {
  isNewUser: boolean;
  user: Me;
}

export interface OtpRequestResult {
  requestId: string;
  expiresAt: string;
  resendAfterSeconds: number;
}

export interface DealerPublic {
  sellerId: string;
  slug: string;
  businessName: string;
  logoUrl: string | null;
  district: { name: string; slug: string } | null;
  memberSince: string;
  activeListingCount: number;
}

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, string> | null;
  isRead: boolean;
  createdAt: string;
}

export interface PresignedUpload {
  imageId: string;
  upload: { method: 'PUT'; url: string; headers: Record<string, string>; expiresAt: string };
}
