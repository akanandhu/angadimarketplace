'use client';

import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { EmptyState, ErrorState } from '@/components/ui/feedback';
import { ListingCard, ListingCardSkeleton, ListingGrid } from '@/features/listings/listing-card';
import { Pagination } from '@/features/search/pagination';
import { favouritesApi } from '@/lib/api/endpoints/listings';
import { errorMessage } from '@/lib/api/errors';
import { keys } from '@/lib/query/keys';
import { routes } from '@/lib/routes';

/** Saved cars; sold/removed ones stay visible with an unavailable overlay. */
export function FavouritesScreen() {
  const [page, setPage] = useState(1);
  const favourites = useQuery({
    queryKey: [...keys.favourites, page],
    queryFn: () => favouritesApi.list(page),
  });

  return (
    <div className="mx-auto max-w-[1320px] space-y-4 px-4 py-6 md:px-6">
      <h1 className="text-2xl font-bold">Saved cars</h1>
      {favourites.isError ? (
        <ErrorState message={errorMessage(favourites.error)} />
      ) : !favourites.data ? (
        <ListingGrid>
          {[0, 1, 2, 3].map((i) => (
            <ListingCardSkeleton key={i} />
          ))}
        </ListingGrid>
      ) : favourites.data.data.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No saved cars yet"
          description="Save cars you like and compare them later."
          action={
            <Link
              href={routes.browse()}
              className="inline-flex h-11 items-center rounded-button bg-brand px-5 text-sm font-semibold text-white"
            >
              Browse cars
            </Link>
          }
        />
      ) : (
        <>
          <ListingGrid>
            {favourites.data.data.map((item) => (
              <ListingCard
                key={item.listing.id}
                listing={item.listing}
                unavailable={!item.isAvailable}
              />
            ))}
          </ListingGrid>
          <Pagination meta={favourites.data.meta} onPage={setPage} />
        </>
      )}
    </div>
  );
}
