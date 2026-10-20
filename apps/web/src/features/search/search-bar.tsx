'use client';

import { MapPin, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { DistrictSelect } from '@/features/catalogue/district-select';
import { track } from '@/lib/analytics';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/routes';

interface Props {
  initialQuery?: string;
  initialDistrict?: string;
  className?: string;
  /** `hero` is the tall home-page field; `compact` sits in the header. */
  variant?: 'hero' | 'compact';
}

/** One joined field: what you want | where | go. */
export function SearchBar({
  initialQuery = '',
  initialDistrict = '',
  className,
  variant = 'hero',
}: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [district, setDistrict] = useState(initialDistrict);
  const hero = variant === 'hero';

  const submit = (event: FormEvent) => {
    event.preventDefault();
    track('search_performed', { q: q.trim(), district });
    router.push(routes.browse({ q: q.trim() || undefined, districtSlug: district || undefined }));
  };

  return (
    <form
      onSubmit={submit}
      role="search"
      className={cn(
        'flex w-full min-w-0 items-stretch overflow-hidden rounded-input bg-surface text-ink focus-within:border-ink',
        hero
          ? 'h-14 border border-line-strong shadow-card'
          : 'h-11 max-w-2xl border border-line-strong',
        className,
      )}
    >
      <label className="relative flex min-w-0 flex-1 items-center">
        <Search className="pointer-events-none absolute left-3.5 size-[18px] text-muted" />
        <input
          type="search"
          aria-label="Search cars"
          placeholder={hero ? 'Swift, Creta, Innova…' : 'Search cars, brands, models'}
          value={q}
          onChange={(event) => setQ(event.target.value)}
          className={cn(
            'size-full min-w-0 bg-transparent pr-3 pl-10 focus:outline-none',
            hero ? 'text-base' : 'text-[15px]',
          )}
        />
      </label>
      <div
        className={cn(
          'relative items-center border-l border-line',
          hero ? 'hidden w-48 sm:flex' : 'hidden w-44 lg:flex',
        )}
      >
        <MapPin className="pointer-events-none absolute left-3 size-4 text-muted" aria-hidden />
        <DistrictSelect
          id={hero ? 'hero-district' : 'header-district'}
          by="slug"
          value={district}
          onChange={setDistrict}
          placeholder="All Kerala"
          className="h-full rounded-none border-0 bg-transparent pl-9 text-sm font-medium focus:ring-0"
        />
      </div>
      <button
        type="submit"
        aria-label="Search"
        className={cn(
          'm-1 flex shrink-0 items-center gap-2 rounded-[calc(var(--radius-input)-3px)] bg-ink font-semibold text-surface hover:bg-ink-soft',
          hero ? 'px-6 text-[15px]' : 'px-4',
        )}
      >
        <Search className="size-[18px]" aria-hidden />
        {hero && <span className="hidden sm:inline">Search</span>}
      </button>
    </form>
  );
}
