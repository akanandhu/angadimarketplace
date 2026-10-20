'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/routes';
import { KERALA_DISTRICTS } from '@/lib/search/districts';

/** Second header tier on discovery pages: one-tap district filters, OLX-style category strip. */
export function DistrictStrip() {
  const pathname = usePathname();
  const all = routes.browse();
  const link = (href: string, text: string, active: boolean) => (
    <li key={href}>
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'block border-b-2 py-3 text-sm font-medium whitespace-nowrap transition-colors',
          active
            ? 'border-ink text-ink'
            : 'border-transparent text-muted hover:border-line-strong hover:text-ink',
        )}
      >
        {text}
      </Link>
    </li>
  );
  return (
    <nav aria-label="Browse by district">
      <ul className="scrollbar-none mx-auto flex max-w-[1320px] gap-5 overflow-x-auto px-4 md:px-6">
        <li className="shrink-0">
          <Link href={all} className="block py-3 text-sm font-semibold whitespace-nowrap text-ink">
            All Kerala
          </Link>
        </li>
        {KERALA_DISTRICTS.map(({ name, slug }) => {
          const href = routes.browse({ districtSlug: slug });
          return link(href, name, pathname === href || pathname.startsWith(`${href}/`));
        })}
      </ul>
    </nav>
  );
}
