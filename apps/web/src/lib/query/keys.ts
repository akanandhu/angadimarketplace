import type { ListingFilters } from '../search/filters';

/** Central TanStack Query keys so mutations can invalidate precisely. */
export const keys = {
  me: ['me'] as const,
  districts: ['districts'] as const,
  brands: ['brands'] as const,
  models: (brandId: string) => ['models', brandId] as const,
  variants: (modelId: string) => ['variants', modelId] as const,
  search: (filters: ListingFilters) => ['listings', 'search', filters] as const,
  listing: (slug: string) => ['listings', 'detail', slug] as const,
  dealer: (slug: string) => ['dealers', slug] as const,
  dealerListings: (slug: string, filters: ListingFilters) => ['dealers', slug, 'listings', filters] as const,
  favourites: ['favourites'] as const,
  myListings: (status: string) => ['my-listings', status] as const,
  myListing: (id: string) => ['my-listings', 'detail', id] as const,
  contactState: (sellerId: string, listingId?: string) => ['contact-state', sellerId, listingId] as const,
  incoming: (status: string) => ['requests', 'incoming', status] as const,
  outgoing: (status: string) => ['requests', 'outgoing', status] as const,
  notifications: ['notifications'] as const,
  unread: ['notifications', 'unread'] as const,
  admin: (section: string, params: object) => ['admin', section, params] as const,
};
