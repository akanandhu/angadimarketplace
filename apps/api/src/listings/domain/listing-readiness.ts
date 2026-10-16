import { ImageStatus } from '../../generated/prisma/client';

export const MAX_IMAGES = 10;

export type ListingStep = 'vehicle' | 'price' | 'district' | 'photos' | 'profile';

interface ReadinessInput {
  hasCarDetails: boolean;
  price: number | null;
  districtId: string | null;
  imageStatuses: ImageStatus[];
  sellerName: string | null;
}

/** Steps still incomplete before a listing may be published. */
export function missingSteps(input: ReadinessInput): ListingStep[] {
  const missing: ListingStep[] = [];
  if (!input.hasCarDetails) missing.push('vehicle');
  if (!input.price || input.price <= 0) missing.push('price');
  if (!input.districtId) missing.push('district');
  if (!input.imageStatuses.includes('READY')) missing.push('photos');
  if (!input.sellerName) missing.push('profile');
  return missing;
}

/** Images still in flight block publishing so the gallery is never half-processed. */
export function hasPendingImages(statuses: ImageStatus[]): boolean {
  return statuses.some((status) => status === 'UPLOADING' || status === 'PROCESSING');
}
