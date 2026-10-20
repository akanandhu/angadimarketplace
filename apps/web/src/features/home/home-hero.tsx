import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/lib/routes';
import { SearchBar } from '../search/search-bar';

const BUDGETS = [
  { label: 'Under ₹3 L', note: 'First cars, city runabouts', filters: { maxPrice: 300000 } },
  {
    label: '₹3 L – ₹5 L',
    note: 'Hatchbacks, compact sedans',
    filters: { minPrice: 300000, maxPrice: 500000 },
  },
  {
    label: '₹5 L – ₹8 L',
    note: 'Sedans, compact SUVs',
    filters: { minPrice: 500000, maxPrice: 800000 },
  },
  { label: '₹8 L – ₹15 L', note: 'SUVs, MPVs', filters: { minPrice: 800000, maxPrice: 1500000 } },
  { label: '₹15 L and up', note: 'Premium and 7-seaters', filters: { minPrice: 1500000 } },
];

const POPULAR = [
  ['Swift', 'Swift'],
  ['Creta', 'Creta'],
  ['Innova Crysta', 'Innova Crysta'],
  ['City', 'Honda City'],
  ['Nexon', 'Nexon'],
] as const;

/** Search-first fold: headline + one joined field on the left, budget shortcuts on the right. */
export function HomeHero() {
  return (
    <section className="grid gap-8 pt-2 md:pt-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-14">
      <div className="min-w-0 space-y-6">
        <div className="space-y-3">
          <p className="text-[15px] font-semibold text-brand">Naattil oru nalla vandi nokkano?</p>
          <h1 className="max-w-[14ch] text-[clamp(2.5rem,4.5vw+1rem,4.75rem)] leading-[1.02] font-bold tracking-[-0.03em]">
            Kerala&apos;s{' '}
            <span className="bg-[linear-gradient(var(--color-gold),var(--color-gold))] bg-[length:100%_0.22em] bg-bottom bg-no-repeat">
              used-car
            </span>{' '}
            market.
          </h1>
          <p className="max-w-md text-[17px] leading-relaxed text-ink-soft">
            Search every district from Kasaragod to Thiruvananthapuram. Sellers keep their number
            private until they accept your request.
          </p>
        </div>
        <SearchBar variant="hero" className="max-w-2xl" />
        <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
          <span>Popular:</span>
          {POPULAR.map(([text, q]) => (
            <Link
              key={q}
              href={routes.browse({ q })}
              className="rounded-full border border-line bg-surface px-3 py-1 font-medium whitespace-nowrap text-ink hover:border-ink"
            >
              {text}
            </Link>
          ))}
        </p>
      </div>

      <nav aria-labelledby="budget-heading" className="min-w-0 self-end">
        <h2 id="budget-heading" className="mb-3 text-lg font-bold">
          Shop by budget
        </h2>
        <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface shadow-card">
          {BUDGETS.map(({ label, note, filters }) => (
            <li key={label}>
              <Link
                href={routes.browse(filters)}
                className="group flex items-center gap-4 px-4 py-3.5 hover:bg-gold-soft"
              >
                <span className="price w-36 shrink-0 text-lg whitespace-nowrap">{label}</span>
                <span className="min-w-0 flex-1 truncate text-sm text-muted">{note}</span>
                <ArrowRight
                  className="mr-1 size-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-ink"
                  aria-hidden
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
