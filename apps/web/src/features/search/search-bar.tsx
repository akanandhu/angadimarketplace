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
    <form onSubmit={submit} role="search" className={cn('flex w-full gap-2', className)}>
      <div className="relative min-w-0 flex-1">
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
        className={cn('w-36 shrink-0', compact ? 'hidden lg:block' : 'sm:w-44')}
      />
      <button
        type="submit"
        aria-label="Search"
        className="flex h-11 shrink-0 items-center gap-2 rounded-button bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft"
      >
        <Search className="size-4" aria-hidden />
        {!compact && <span className="hidden sm:inline">Search</span>}
      </button>
    </form>
  );
}
