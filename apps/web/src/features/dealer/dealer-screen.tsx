'use client';

import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, Store } from 'lucide-react';
import { useState } from 'react';
import { Badge, EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { ConnectedActions } from '@/features/contact/connected-actions';
import { useContactState } from '@/features/contact/use-contact-state';
import { ListingCard, ListingCardSkeleton, ListingGrid } from '@/features/listings/listing-card';
import { Pagination } from '@/features/search/pagination';
import { dealersApi } from '@/lib/api/endpoints/listings';
import { errorMessage } from '@/lib/api/errors';
import type { DealerPublic, ListingCard as Card, Page } from '@/lib/api/types';
import { memberSince } from '@/lib/format';
import { keys } from '@/lib/query/keys';

interface Props {
  slug: string;
  initialDealer?: DealerPublic;
  initialListings?: Page<Card>;
}

/** Public dealer page. The phone appears only for buyers with an approved connection. */
export function DealerScreen({ slug, initialDealer, initialListings }: Props) {
  const [page, setPage] = useState(1);
  const dealer = useQuery({
    queryKey: keys.dealer(slug),
    queryFn: () => dealersApi.get(slug),
    initialData: initialDealer,
  });
  const listings = useQuery({
    queryKey: keys.dealerListings(slug, { page }),
    queryFn: () => dealersApi.listings(slug, { page, limit: 20 }),
    initialData: page === 1 ? initialListings : undefined,
  });
  const contact = useContactState(dealer.data?.sellerId ?? '', undefined, Boolean(dealer.data));

  if (dealer.isError) return <ErrorState message={errorMessage(dealer.error)} />;
  const d = dealer.data;

  return (
    <div className="mx-auto max-w-[1320px] space-y-6 px-4 py-6 md:px-6">
      {!d ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <header className="flex flex-col gap-4 rounded-card border border-line bg-surface p-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold-soft text-ink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {d.logoUrl ? (
                <img src={d.logoUrl} alt="" className="size-full object-cover" />
              ) : (
                <Store className="size-7" aria-hidden />
              )}
            </div>
            <div>
              <h1 className="flex flex-wrap items-center gap-2 text-xl font-bold">
                {d.businessName}
                <Badge tone="gold">
                  <BadgeCheck className="size-3" aria-hidden /> Dealer
                </Badge>
              </h1>
              <p className="text-sm text-muted">
                {[
                  d.district?.name,
                  `Member since ${memberSince(d.memberSince)}`,
                  `${d.activeListingCount} active listings`,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </p>
            </div>
          </div>
          {contact.data?.state === 'CONNECTED' ? (
            <ConnectedActions
              contact={contact.data.sellerContact}
              who="Dealer"
              className="md:w-80"
            />
          ) : (
            <p className="text-sm text-muted md:max-w-xs">
              To contact this dealer, open a car and tap Request contact.
            </p>
          )}
        </header>
      )}

      <section aria-labelledby="inventory-heading" className="space-y-3">
        <h2 id="inventory-heading" className="text-lg font-bold">
          Cars from {d?.businessName ?? 'this dealer'}
        </h2>
        {!listings.data ? (
          <ListingGrid>
            {[0, 1, 2, 3].map((i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </ListingGrid>
        ) : listings.data.data.length === 0 ? (
          <EmptyState title="No active listings right now" />
        ) : (
          <>
            <ListingGrid>
              {listings.data.data.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </ListingGrid>
            <Pagination meta={listings.data.meta} onPage={setPage} />
          </>
        )}
      </section>
    </div>
  );
}
