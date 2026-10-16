'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { listingsApi } from '@/lib/api/endpoints/listings';
import type { ListingCard as Card, Page } from '@/lib/api/types';
import { keys } from '@/lib/query/keys';
import { routes } from '@/lib/routes';
import { useAuth } from '../auth/auth-provider';
import { ListingCard, ListingCardSkeleton, ListingGrid } from '../listings/listing-card';
import { SearchBar } from '../search/search-bar';
import { AdSlot } from './ad-slot';
import { BrowseByBrand, BrowseByDistrict } from './browse-shortcuts';

const RECENT = { sort: 'newest' as const, limit: 12 };

export function HomeScreen({ initialRecent }: { initialRecent?: Page<Card> }) {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const recent = useQuery({
    queryKey: keys.search(RECENT),
    queryFn: () => listingsApi.search(RECENT),
    initialData: initialRecent,
  });

  return (
    <div className="mx-auto max-w-[1320px] space-y-10 px-4 py-6 md:px-6 md:py-10">
      <section className="rounded-2xl bg-ink px-5 py-8 text-white md:px-10 md:py-12">
        <p className="text-sm font-semibold text-gold">Naattil oru nalla vandi nokkano?</p>
        <h1 className="mt-2 max-w-xl text-2xl font-extrabold md:text-4xl">
          Find your next ride, right here in Kerala.
        </h1>
        <SearchBar className="mt-6 max-w-3xl" />
      </section>

      <BrowseByBrand />
      <BrowseByDistrict />

      <section aria-labelledby="recent-heading">
        <div className="mb-3 flex items-end justify-between">
          <h2 id="recent-heading" className="text-lg font-bold">
            Recently listed cars
          </h2>
          <Link href={routes.browse()} className="text-sm font-semibold text-brand">
            View all
          </Link>
        </div>
        <ListingGrid>
          {recent.data
            ? recent.data.data.map((listing, index) => (
                <ListingCard key={listing.id} listing={listing} eager={index < 4} />
              ))
            : Array.from({ length: 8 }, (_, i) => <ListingCardSkeleton key={i} />)}
        </ListingGrid>
      </section>

      <AdSlot />

      <section className="flex flex-col items-start gap-4 rounded-2xl border border-gold/40 bg-gold-soft p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <h2 className="text-xl font-bold">Selling your car? List it free on Angadi.</h2>
          <p className="mt-1 text-sm text-muted">
            Your number stays private. You choose who gets your contact.
          </p>
        </div>
        <Button variant="secondary" size="lg" onClick={() => requireAuth(() => router.push(routes.sell()))}>
          Sell your car
        </Button>
      </section>
    </div>
  );
}
