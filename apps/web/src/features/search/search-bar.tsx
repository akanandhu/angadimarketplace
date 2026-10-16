'use client';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { DistrictSelect } from '@/features/catalogue/district-select';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/routes';

interface Props {
  initialQuery?: string;
  initialDistrict?: string;
  className?: string;
  /** Compact header variant hides the search button label. */
  compact?: boolean;
}

export function SearchBar({ initialQuery = '', initialDistrict = '', className, compact }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [district, setDistrict] = useState(initialDistrict);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    router.push(routes.browse({ q: q.trim() || undefined, districtSlug: district || undefined }));
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      className={cn(
        'grid w-full gap-2 text-ink',
        compact
          ? 'grid-cols-[1fr_auto] lg:grid-cols-[1fr_10rem_auto]'
          : 'grid-cols-[1fr_auto] sm:grid-cols-[1fr_11rem_auto]',
        className,
      )}
    >
      <div className="relative min-w-0">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
        <input
          type="search"
          aria-label="Search cars"
          placeholder="Search Swift, Creta, Hyundai..."
          value={q}
          onChange={(event) => setQ(event.target.value)}
          className="h-11 w-full rounded-input border border-line-strong bg-surface pr-3 pl-9 text-[15px] focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
        />
      </div>
      <DistrictSelect
        id={compact ? 'header-district' : 'hero-district'}
        by="slug"
        value={district}
        onChange={setDistrict}
        placeholder="All Kerala"
        className={cn(
          compact ? 'hidden lg:block' : 'col-span-2 row-start-2 sm:col-span-1 sm:row-start-auto',
        )}
      />
      <button
        type="submit"
        aria-label="Search"
        className={cn(
          'flex h-11 shrink-0 items-center gap-2 rounded-button px-4 text-sm font-semibold text-white',
          compact ? 'bg-ink hover:bg-ink-soft' : 'bg-brand hover:bg-brand-strong',
        )}
      >
        <Search className="size-4" aria-hidden />
        {!compact && <span className="hidden sm:inline">Search</span>}
      </button>
    </form>
  );
}
