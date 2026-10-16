'use client';

import { useQuery } from '@tanstack/react-query';
import { CarFront } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { Tabs } from '@/components/ui/tabs';
import { Pagination } from '@/features/search/pagination';
import { sellerApi } from '@/lib/api/endpoints/seller';
import { errorMessage } from '@/lib/api/errors';
import type { ListingStatus } from '@/lib/api/types';
import { keys } from '@/lib/query/keys';
import { routes } from '@/lib/routes';
import { SellerListingCard } from './seller-listing-card';

const TABS: { value: ListingStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DRAFT', label: 'Drafts' },
  { value: 'SOLD', label: 'Sold' },
  { value: 'REMOVED', label: 'Removed' },
];

const EMPTY: Record<ListingStatus, string> = {
  ACTIVE: "You haven't listed a vehicle yet",
  DRAFT: 'No drafts',
  SOLD: 'No sold vehicles yet',
  REMOVED: 'No removed listings',
};

export function MyListingsScreen() {
  const router = useRouter();
  const tabParam = useSearchParams().get('tab') as ListingStatus | null;
  const tab = TABS.some((t) => t.value === tabParam) ? tabParam! : 'ACTIVE';
  const [page, setPage] = useState(1);
  const listings = useQuery({
    queryKey: [...keys.myListings(tab), page],
    queryFn: () => sellerApi.list(tab, page),
  });

  return (
    <div className="mx-auto max-w-4xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My listings</h1>
        <Link
          href={routes.sell()}
          className="inline-flex h-10 items-center rounded-button bg-brand px-4 text-sm font-semibold text-white"
        >
          Sell a car
        </Link>
      </div>
      <Tabs
        label="Listing status"
        tabs={TABS}
        value={tab}
        onChange={(value) => {
          setPage(1);
          router.replace(routes.myListings(value));
        }}
      />
      {listings.isError ? (
        <ErrorState message={errorMessage(listings.error)} />
      ) : !listings.data ? (
        <div className="grid gap-3 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44 w-full" />
          ))}
        </div>
      ) : listings.data.data.length === 0 ? (
        <EmptyState
          icon={CarFront}
          title={EMPTY[tab]}
          action={
            tab === 'ACTIVE' && (
              <Link
                href={routes.sell()}
                className="inline-flex h-11 items-center rounded-button bg-brand px-5 text-sm font-semibold text-white"
              >
                Sell a car
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            {listings.data.data.map((listing) => (
              <SellerListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <Pagination meta={listings.data.meta} onPage={setPage} />
        </>
      )}
    </div>
  );
}
