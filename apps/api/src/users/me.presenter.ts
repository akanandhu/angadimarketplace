import { DealerProfile, District, User } from '../generated/prisma/client';
import { MediaUrlService } from '../media/media-url.service';

export type UserWithProfile = User & {
  district: District | null;
  dealerProfile: DealerProfile | null;
};

export const ME_INCLUDE = { district: true, dealerProfile: true } as const;

/** Private self view. The only place a user's own phone number is returned. */
export function presentMe(user: UserWithProfile, media: MediaUrlService) {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    phoneVerified: true,
    accountType: user.accountType,
    role: user.role,
    status: user.status,
    district: user.district
      ? { id: user.district.id, name: user.district.name, slug: user.district.slug }
      : null,
    profileImageUrl: media.image(user.profileImageKey),
    defaultAllowSellerContact: user.defaultAllowSellerContact,
    memberSince: user.createdAt.toISOString(),
    isProfileComplete: Boolean(user.name && user.districtId),
    dealerProfile: user.dealerProfile
      ? {
          businessName: user.dealerProfile.businessName,
          slug: user.dealerProfile.slug,
          logoUrl: media.image(user.dealerProfile.logoKey),
          districtId: user.dealerProfile.districtId,
        }
      : null,
  };
}

export type MeView = ReturnType<typeof presentMe>;
