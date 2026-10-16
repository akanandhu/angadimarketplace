'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { listingsApi } from '@/lib/api/endpoints/listings';
import { formatNumber } from '@/lib/format';
import type { ListingFilters } from '@/lib/search/filters';
import { FilterPanel } from './filter-panel';

interface Props {
  open: boolean;
  onClose: () => void;
  filters: ListingFilters;
  onApply: (filters: ListingFilters) => void;
}

/** Full-height filter sheet; edits a draft and previews the result count before applying. */
export function MobileFilterSheet({ open, onClose, filters, onApply }: Props) {
  const [draft, setDraft] = useState(filters);
  useEffect(() => {
    if (open) setDraft(filters);
  }, [open, filters]);

  const preview = useQuery({
    queryKey: ['listings', 'count', draft],
    queryFn: () => listingsApi.search({ ...draft, page: 1, limit: 1 }),
    enabled: open,
  });
  const total = preview.data?.meta.total;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Filters"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={() => setDraft({ q: draft.q, sort: draft.sort })}>
            Clear all
          </Button>
          <Button block onClick={() => onApply({ ...draft, page: 1 })}>
            {total === undefined ? 'Show cars' : `Show ${formatNumber(total)} cars`}
          </Button>
        </>
      }
    >
      <FilterPanel
        idPrefix="mobile-filter"
        filters={draft}
        onChange={(patch) => setDraft((current) => ({ ...current, ...patch }))}
      />
    </Sheet>
  );
}
