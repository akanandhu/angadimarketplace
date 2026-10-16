'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { SearchX, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Fragment, useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState } from '@/components/ui/feedback';
import { AdSlot } from '@/features/home/ad-slot';
import { ListingCard, ListingCardSkeleton, ListingGrid } from '@/features/listings/listing-card';
import { listingsApi } from '@/lib/api/endpoints/listings';
import { errorMessage } from '@/lib/api/errors';
import type { ListingCard as Card, Page } from '@/lib/api/types';
import { formatNumber } from '@/lib/format';
import { keys } from '@/lib/query/keys';
import { routes } from '@/lib/routes';
import { countActiveFilters, ListingFilters, SORT_LABELS, SortOption } from '@/lib/search/filters';
import { ActiveFilterChips } from './active-filter-chips';
import { FilterPanel } from './filter-panel';
import { MobileFilterSheet } from './mobile-filter-sheet';
import { Pagination } from './pagination';
import { useBrowseHeading } from './use-browse-heading';

interface Props {
  filters: ListingFilters;
  initialData?: Page<Card>;
  heading?: string;
  intro?: string;
}

export function BrowseScreen({ filters, initialData, heading, intro }: Props) {
  const router = useRouter();
  const [sheetOpen, setSheetOpen] = useState(false);
  const title = useBrowseHeading(filters, heading);
  const results = useQuery({
    queryKey: keys.search(filters),
    queryFn: () => listingsApi.search(filters),
    initialData,
    placeholderData: keepPreviousData,
  });

  const navigate = (next: ListingFilters) => router.push(routes.browse(next), { scroll: false });
  const update = (patch: Partial<ListingFilters>) =>
    navigate({ ...filters, ...patch, page: 'page' in patch ? patch.page : 1 });
  const clearAll = () => navigate({ sort: filters.sort });
  const activeCount = countActiveFilters(filters);

  const sortSelect = (
    <select
      aria-label="Sort by"
      value={filters.sort ?? 'newest'}
      onChange={(event) => update({ sort: event.target.value as SortOption })}
      className="h-10 rounded-input border border-line-strong bg-surface px-2.5 text-sm font-medium"
    >
      {Object.entries(SORT_LABELS).map(([value, text]) => (
        <option key={value} value={value}>
          {text}
        </option>
      ))}
    </select>
  );

  return (
    <div className="mx-auto flex max-w-[1320px] gap-8 px-4 py-6 md:px-6">
      <aside className="hidden w-72 shrink-0 lg:block" aria-label="Filters">
        <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-card border border-line bg-surface px-4">
          <FilterPanel idPrefix="filter" filters={filters} onChange={update} />
        </div>
      </aside>

      <section className="min-w-0 flex-1 space-y-4">
        <header className="space-y-1">
          <h1 className="text-xl font-bold md:text-2xl">{title}</h1>
          {intro && <p className="text-sm text-muted">{intro}</p>}
          <p className="text-sm text-muted" aria-live="polite">
            {results.data ? `${formatNumber(results.data.meta.total)} ${results.data.meta.total === 1 ? 'listing' : 'listings'}` : 'Loading…'}
          </p>
        </header>

        <div className="sticky top-16 z-30 -mx-4 flex gap-2 border-b border-line bg-canvas/95 px-4 py-2 backdrop-blur lg:hidden">
          <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
            <SlidersHorizontal className="size-4" /> Filters{activeCount ? ` (${activeCount})` : ''}
          </Button>
          {sortSelect}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <ActiveFilterChips filters={filters} onChange={update} />
          <div className="ml-auto hidden lg:block">{sortSelect}</div>
        </div>

        {results.isError ? (
          <ErrorState
            message={errorMessage(results.error)}
            action={<Button onClick={() => results.refetch()}>Retry</Button>}
          />
        ) : !results.data ? (
          <ListingGrid>
            {Array.from({ length: 8 }, (_, i) => (
              <ListingCardSkeleton key={i} />
            ))}
          </ListingGrid>
        ) : results.data.data.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title="No cars match these filters"
            description="Try changing your price, district or vehicle filters."
            action={<Button onClick={clearAll}>Clear filters</Button>}
          />
        ) : (
          <div className={results.isPlaceholderData ? 'opacity-60 transition-opacity' : ''}>
            <ListingGrid>
              {results.data.data.map((listing, index) => (
                <Fragment key={listing.id}>
                  {index === 8 && <AdSlot className="col-span-full" />}
                  <ListingCard listing={listing} eager={index < 4} />
                </Fragment>
              ))}
            </ListingGrid>
            <Pagination meta={results.data.meta} onPage={(page) => update({ page })} />
          </div>
        )}
      </section>

      <MobileFilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        onApply={(next) => {
          setSheetOpen(false);
          navigate(next);
        }}
      />
    </div>
  );
}
