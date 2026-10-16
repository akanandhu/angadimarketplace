export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface Page<T> {
  data: T[];
  meta: PageMeta;
}

export type FuelType = 'PETROL' | 'DIESEL' | 'CNG' | 'ELECTRIC';
export type Transmission = 'MANUAL' | 'AUTOMATIC';
export type AccidentHistory = 'NO' | 'MINOR' | 'MAJOR';
export type InsuranceType = 'COMPREHENSIVE' | 'THIRD_PARTY' | 'EXPIRED';
export type ListingStatus = 'DRAFT' | 'ACTIVE' | 'SOLD' | 'REMOVED';
export type ImageStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
export type AccountType = 'INDIVIDUAL' | 'DEALER';

export interface ImageUrls {
  thumb: string;
  card: string;
  detail: string;
}

export interface DistrictRef {
  id?: string;
  name: string;
  slug: string;
}

export interface District {
  id: string;
  name: string;
  slug: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface Model {
  id: string;
  name: string;
  slug: string;
}

export interface Variant {
  id: string;
  name: string;
  fuelType: FuelType | null;
  transmission: Transmission | null;
}
