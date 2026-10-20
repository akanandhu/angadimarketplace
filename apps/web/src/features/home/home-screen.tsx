'use client';

import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '@/lib/api/endpoints/listings';
import type { ListingCard as Card, Page } from '@/lib/api/types';
import { formatNumber } from '@/lib/format';
import { keys } from '@/lib/query/keys';
import { routes } from '@/lib/routes';
import { ListingCard, ListingCardSkeleton, ListingGrid } from '../listings/listing-card';
import { AdSlot } from './ad-slot';
import { BrowseByBrand, BrowseByDistrict, SectionHead } from './browse-shortcuts';
import { HomeHero } from './home-hero';
import { SellBand } from './sell-band';

const RECENT = { sort: 'newest' as const, limit: 12 };

export function HomeScreen({ initialRecent }: { initialRecent?: Page<Card> }) {
  const recent = useQuery({
    queryKey: keys.search(RECENT),
    queryFn: () => listingsApi.search(RECENT),
    initialData: initialRecent,
  });
  const total = recent.data?.meta.total;

  return (
    <>
      <div className="mx-auto max-w-[1320px] space-y-14 px-4 py-6 md:space-y-16 md:px-6 md:py-10">
        <HomeHero />

        <section aria-labelledby="recent-heading">
          <SectionHead
            id="recent-heading"
            title="Just listed"
            href={routes.browse()}
            more={total ? `See all ${formatNumber(total)}` : 'See all'}
          />
          <ListingGrid>
            {recent.data
              ? recent.data.data.map((listing, index) => (
                  <ListingCard key={listing.id} listing={listing} eager={index < 4} />
                ))
              : Array.from({ length: 8 }, (_, i) => <ListingCardSkeleton key={i} />)}
          </ListingGrid>
        </section>

        <BrowseByDistrict />
        <BrowseByBrand />
        <AdSlot />
      </div>
      <SellBand />
    </>
  );
}
