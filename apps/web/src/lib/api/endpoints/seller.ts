import { api, apiPage } from '../client';
import type { ListingStats, ListingStatus, PresignedUpload, SellerListing } from '../types';

export interface CarDetailsInput {
  brandId: string;
  modelId: string;
  variantId: string | null;
  variantText: string | null;
  manufacturingYear: number;
  fuelType: string;
  transmission: string;
  kmDriven: number;
  numberOfOwners: number;
  registrationNumber: string;
  accidentHistory?: string | null;
  hasMajorReplacement?: boolean | null;
  replacementDetails?: string | null;
  colour?: string | null;
}

export interface ListingPatch {
  description?: string;
  price?: number;
  isNegotiable?: boolean;
  districtId?: string;
}

const base = (id: string) => `/me/listings/${id}`;

export const sellerApi = {
  createDraft: () =>
    api<SellerListing>('/me/listings/drafts', { method: 'POST', body: { category: 'CARS' } }),
  list: (status: ListingStatus, page = 1) =>
    apiPage<SellerListing>('/me/listings', { status, page, limit: 20 }),
  get: (id: string) => api<SellerListing>(base(id)),
  update: (id: string, patch: ListingPatch) =>
    api<SellerListing>(base(id), { method: 'PATCH', body: patch }),
  putCarDetails: (id: string, input: CarDetailsInput) =>
    api<SellerListing>(`${base(id)}/car-details`, { method: 'PUT', body: input }),
  publish: (id: string) => api<SellerListing>(`${base(id)}/publish`, { method: 'POST' }),
  markSold: (id: string) => api<SellerListing>(`${base(id)}/mark-sold`, { method: 'POST' }),
  remove: (id: string) => api<SellerListing>(`${base(id)}/remove`, { method: 'POST' }),
  deleteDraft: (id: string) => api(base(id), { method: 'DELETE' }),
  stats: (id: string) => api<ListingStats>(`${base(id)}/stats`),
};

export interface FileMeta {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export const listingImagesApi = {
  requestUpload: (listingId: string, file: FileMeta) =>
    api<PresignedUpload>(`${base(listingId)}/images/upload-request`, {
      method: 'POST',
      body: file,
    }),
  retry: (listingId: string, imageId: string, file: FileMeta) =>
    api<PresignedUpload>(`${base(listingId)}/images/${imageId}/retry`, {
      method: 'POST',
      body: file,
    }),
  complete: (listingId: string, imageId: string) =>
    api<{ status: string }>(`${base(listingId)}/images/${imageId}/complete`, { method: 'POST' }),
  remove: (listingId: string, imageId: string) =>
    api(`${base(listingId)}/images/${imageId}`, { method: 'DELETE' }),
  reorder: (listingId: string, imageIds: string[]) =>
    api(`${base(listingId)}/images/order`, { method: 'PUT', body: { imageIds } }),
};

export const userImagesApi = {
  requestProfile: (file: FileMeta) =>
    api<PresignedUpload>('/me/profile-image/upload-request', { method: 'POST', body: file }),
  requestLogo: (file: FileMeta) =>
    api<PresignedUpload>('/me/dealer-profile/logo/upload-request', { method: 'POST', body: file }),
  complete: (imageId: string) =>
    api<{ status: string }>(`/me/user-images/${imageId}/complete`, { method: 'POST' }),
  status: (imageId: string) =>
    api<{ status: string; failureReason: string | null }>(`/me/user-images/${imageId}`),
};

/** PUTs the file straight to S3 with progress; bytes never pass through the API. */
export function uploadToStorage(
  upload: PresignedUpload['upload'],
  file: Blob,
  onProgress?: (fraction: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(upload.method, upload.url);
    Object.entries(upload.headers).forEach(([key, value]) => xhr.setRequestHeader(key, value));
    xhr.upload.onprogress = (event) =>
      event.lengthComputable && onProgress?.(event.loaded / event.total);
    xhr.onload = () =>
      xhr.status < 300 ? resolve() : reject(new Error(`Upload failed (${xhr.status})`));
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(file);
  });
}
