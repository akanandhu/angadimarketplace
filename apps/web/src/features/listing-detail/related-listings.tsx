'use client';

import { useQuery } from '@tanstack/react-query';
import { ListingCard, ListingGrid } from '@/features/listings/listing-card';
import { listingsApi } from '@/lib/api/endpoints/listings';
import type { ListingDetail } from '@/lib/api/types';
import type { ListingFilters } from '@/lib/search/filters';

/** Dealers: more from this seller. Individuals: similar cars (same model, else brand). */
export function RelatedListings({ listing }: { listing: ListingDetail }) {
  const fromDealer = listing.seller.type === 'DEALER';
  const filters: ListingFilters & { sellerId?: string; excludeListingId: string } = {
    limit: 4,
    excludeListingId: listing.id,
    ...(fromDealer ? { sellerId: listing.seller.id } : { brandSlug: listing.car?.brand.slug }),
  };
  const related = useQuery({
    queryKey: ['listings', 'related', filters],
    queryFn: () => listingsApi.search(filters),
  });
  const items = related.data?.data ?? [];
  if (!items.length) return null;

  return (
    <section aria-labelledby="related-heading" className="space-y-3">
      <h2 id="related-heading" className="text-lg font-bold">
        {fromDealer ? `More cars from ${listing.seller.displayName}` : 'Similar cars'}
      </h2>
      <ListingGrid>
        {items.map((item) => (
          <ListingCard key={item.id} listing={item} />
        ))}
      </ListingGrid>
    </section>
  );
}
