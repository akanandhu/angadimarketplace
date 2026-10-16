export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'km_asc';

export interface ListingFilters {
  q?: string;
  districtSlug?: string;
  brandSlug?: string;
  modelSlug?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  minKm?: number;
  maxKm?: number;
  numberOfOwners?: number;
  fuelType?: string[];
  transmission?: string[];
  sort?: SortOption;
  page?: number;
  limit?: number;
}

const NUMERIC = [
  'minPrice',
  'maxPrice',
  'minYear',
  'maxYear',
  'minKm',
  'maxKm',
  'numberOfOwners',
  'page',
] as const;
const TEXT = ['q', 'districtSlug', 'brandSlug', 'modelSlug'] as const;
const LISTS = ['fuelType', 'transmission'] as const;

export const SORT_LABELS: Record<SortOption, string> = {
  newest: 'Newest first',
  price_asc: 'Price: low to high',
  price_desc: 'Price: high to low',
  km_asc: 'KM: low to high',
};

type ParamSource = { get(key: string): string | null };

export function parseFilters(params: ParamSource): ListingFilters {
  const filters: ListingFilters = {};
  for (const key of TEXT) {
    const value = params.get(key);
    if (value) filters[key] = value;
  }
  for (const key of NUMERIC) {
    const value = Number(params.get(key));
    if (Number.isFinite(value) && value > 0) filters[key] = value;
  }
  for (const key of LISTS) {
    const value = params.get(key);
    if (value) filters[key] = value.split(',').filter(Boolean);
  }
  const sort = params.get('sort') as SortOption | null;
  if (sort && sort in SORT_LABELS) filters.sort = sort;
  return filters;
}

/** Query string for every filter except those already encoded in the path. */
export function filtersToQuery(filters: ListingFilters, omit: (keyof ListingFilters)[] = []) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (omit.includes(key as keyof ListingFilters) || value === undefined || value === '') continue;
    if (key === 'sort' && value === 'newest') continue;
    if (key === 'page' && value === 1) continue;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(','));
    } else params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : '';
}

/** Number of user-facing filters applied (for the mobile "Filters (3)" badge). */
export function countActiveFilters(filters: ListingFilters): number {
  const keys: (keyof ListingFilters)[] = [
    'districtSlug',
    'brandSlug',
    'modelSlug',
    'numberOfOwners',
  ];
  let count = keys.filter((key) => filters[key]).length;
  if (filters.minPrice || filters.maxPrice) count++;
  if (filters.minYear || filters.maxYear) count++;
  if (filters.minKm || filters.maxKm) count++;
  count += filters.fuelType?.length ? 1 : 0;
  count += filters.transmission?.length ? 1 : 0;
  return count;
}
