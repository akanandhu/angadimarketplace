import Link from 'next/link';
import { routes } from '@/lib/routes';
import { KERALA_DISTRICTS } from '@/lib/search/districts';

const BRANDS = [
  ['Maruti Suzuki', 'maruti-suzuki'],
  ['Hyundai', 'hyundai'],
  ['Tata', 'tata'],
  ['Toyota', 'toyota'],
  ['Honda', 'honda'],
  ['Mahindra', 'mahindra'],
  ['Kia', 'kia'],
  ['Renault', 'renault'],
] as const;

export function BrowseByBrand() {
  return (
    <section aria-labelledby="brands-heading">
      <h2 id="brands-heading" className="mb-3 text-lg font-bold">
        Browse by brand
      </h2>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 md:mx-0 md:grid md:grid-cols-9 md:px-0">
        {BRANDS.map(([name, slug]) => (
          <Link
            key={slug}
            href={routes.browse({ brandSlug: slug })}
            className="flex h-20 w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-card border border-line bg-surface text-center text-sm font-semibold hover:border-brand md:w-auto"
          >
            <span className="flex size-8 items-center justify-center rounded-full bg-brand-soft text-xs font-extrabold text-brand">
              {name.charAt(0)}
            </span>
            {name}
          </Link>
        ))}
        <Link
          href={routes.browse()}
          className="flex h-20 w-28 shrink-0 items-center justify-center rounded-card border border-dashed border-line-strong text-sm font-semibold text-brand md:w-auto"
        >
          More brands
        </Link>
      </div>
    </section>
  );
}

export function BrowseByDistrict() {
  return (
    <section aria-labelledby="districts-heading">
      <h2 id="districts-heading" className="mb-3 text-lg font-bold">
        Browse by district
      </h2>
      <div className="-mx-4 grid auto-cols-max grid-flow-col grid-rows-2 gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex md:flex-wrap md:px-0">
        {KERALA_DISTRICTS.map(({ name, slug }) => (
          <Link
            key={slug}
            href={routes.browse({ districtSlug: slug })}
            className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium hover:border-brand hover:text-brand"
          >
            {name}
          </Link>
        ))}
      </div>
    </section>
  );
}
