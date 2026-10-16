import { api, apiPage } from '../client';
import type { DealerPublic, FavouriteItem, ListingCard, ListingDetail } from '../types';
import type { ListingFilters } from '../../search/filters';

export const listingsApi = {
  search: (filters: ListingFilters) => apiPage<ListingCard>('/listings', { ...filters }),
  detail: (slug: string) => api<ListingDetail>(`/listings/${encodeURIComponent(slug)}`),
  recordView: (listingId: string) =>
    api(`/listings/${listingId}/view`, { method: 'POST' }).catch(() => undefined),
  report: (listingId: string, reason: string, details?: string) =>
    api(`/listings/${listingId}/reports`, { method: 'POST', body: { reason, details } }),
};

export const dealersApi = {
  get: (slug: string) => api<DealerPublic>(`/dealers/${encodeURIComponent(slug)}`),
  listings: (slug: string, filters: ListingFilters) =>
    apiPage<ListingCard>(`/dealers/${encodeURIComponent(slug)}/listings`, { ...filters }),
};

export const favouritesApi = {
  list: (page = 1) => apiPage<FavouriteItem>('/me/favourites', { page, limit: 24 }),
  save: (listingId: string) => api(`/me/favourites/${listingId}`, { method: 'PUT' }),
  remove: (listingId: string) => api(`/me/favourites/${listingId}`, { method: 'DELETE' }),
};
