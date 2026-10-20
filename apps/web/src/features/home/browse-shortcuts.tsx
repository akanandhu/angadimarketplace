import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Plate } from '@/components/ui/plate';
import { routes } from '@/lib/routes';
import { KERALA_DISTRICTS } from '@/lib/search/districts';

const BRANDS = [
  ['Maruti Suzuki', 'maruti-suzuki'],
  ['Hyundai', 'hyundai'],
  ['Toyota', 'toyota'],
  ['Honda', 'honda'],
  ['Tata', 'tata'],
  ['Mahindra', 'mahindra'],
  ['Kia', 'kia'],
  ['Renault', 'renault'],
] as const;

function SectionHead({
  id,
  title,
  href,
  more,
}: {
  id: string;
  title: string;
  href: string;
  more: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 id={id} className="text-2xl font-bold md:text-[1.75rem]">
        {title}
      </h2>
      <Link
        href={href}
        className="flex shrink-0 items-center gap-1 text-sm font-semibold whitespace-nowrap text-ink hover:text-brand"
      >
        {more} <ArrowRight className="size-4" aria-hidden />
      </Link>
    </div>
  );
}

/** Typographic brand index: names set large, no fake logos. */
export function BrowseByBrand() {
  return (
    <section aria-labelledby="brands-heading">
      <SectionHead
        id="brands-heading"
        title="Browse by brand"
        href={routes.browse()}
        more="All brands"
      />
      <ul className="flex flex-wrap items-baseline gap-x-2 gap-y-1 border-y border-line py-4">
        {BRANDS.map(([name, slug], index) => (
          <li key={slug} className="flex items-baseline gap-2">
            {index > 0 && (
              <span className="font-display text-xl text-line-strong md:text-3xl" aria-hidden>
                /
              </span>
            )}
            <Link
              href={routes.browse({ brandSlug: slug })}
              className="font-display text-xl font-semibold tracking-tight whitespace-nowrap decoration-gold decoration-[3px] underline-offset-[6px] hover:underline md:text-3xl"
            >
              {name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Districts as the KL registration plates every Malayali already reads at a glance. */
export function BrowseByDistrict() {
  return (
    <section aria-labelledby="districts-heading">
      <SectionHead
        id="districts-heading"
        title="Cars near you"
        href={routes.browse()}
        more="All Kerala"
      />
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
        {KERALA_DISTRICTS.map(({ name, slug, rto }) => (
          <li key={slug} className="min-w-0">
            <Link
              href={routes.browse({ districtSlug: slug })}
              className="flex h-full flex-col items-start gap-2.5 rounded-card border border-line bg-surface p-3.5 shadow-card transition-shadow hover:shadow-raised"
            >
              <Plate>{rto}</Plate>
              <span className="w-full truncate text-[15px] font-semibold">{name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

export { SectionHead };
