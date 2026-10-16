import { isMobileBuild } from './env';
import { filtersToQuery, ListingFilters } from './search/filters';

/**
 * Builds links that work for both targets. The web build has SEO paths
 * (/cars/ernakulam, /car/<slug>); the static mobile build uses query-string screens.
 */
export const routes = {
  home: () => '/',

  browse(filters: ListingFilters = {}) {
    if (isMobileBuild) return `/search${filtersToQuery(filters)}`;
    const segments = ['/cars'];
    const omit: (keyof ListingFilters)[] = [];
    if (filters.districtSlug) {
      segments.push(filters.districtSlug);
      omit.push('districtSlug');
    }
    if (filters.brandSlug) {
      segments.push(filters.brandSlug);
      omit.push('brandSlug');
      if (filters.modelSlug) {
        segments.push(filters.modelSlug);
        omit.push('modelSlug');
      }
    }
    return `${segments.join('/')}${filtersToQuery(filters, omit)}`;
  },

  listing: (slug: string) =>
    isMobileBuild ? `/listing?slug=${encodeURIComponent(slug)}` : `/car/${slug}`,

  dealer: (slug: string) =>
    isMobileBuild ? `/dealer?slug=${encodeURIComponent(slug)}` : `/dealers/${slug}`,

  sell: (draftId?: string) => (draftId ? `/sell?id=${draftId}` : '/sell'),
  myListings: (tab?: string) => (tab ? `/my-listings?tab=${tab}` : '/my-listings'),
  requests: (view?: 'received' | 'sent') => (view ? `/requests?view=${view}` : '/requests'),
  favourites: () => '/favourites',
  notifications: () => '/notifications',
  profile: () => '/profile',
  login: (next?: string) => (next ? `/login?next=${encodeURIComponent(next)}` : '/login'),
};

/** Absolute public URL for sharing (always the web URL). */
export function shareUrl(siteUrl: string, slug: string) {
  return `${siteUrl}/car/${slug}`;
}
