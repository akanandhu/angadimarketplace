import Link from 'next/link';
import { routes } from '@/lib/routes';
import { KERALA_DISTRICTS } from '@/lib/search/districts';
import { Logo } from './logo';

const POPULAR = [
  { label: 'Maruti Suzuki', href: routes.browse({ brandSlug: 'maruti-suzuki' }) },
  { label: 'Hyundai', href: routes.browse({ brandSlug: 'hyundai' }) },
  {
    label: 'Toyota Innova Crysta',
    href: routes.browse({ brandSlug: 'toyota', modelSlug: 'innova-crysta' }),
  },
  { label: 'Tata', href: routes.browse({ brandSlug: 'tata' }) },
  { label: 'Mahindra', href: routes.browse({ brandSlug: 'mahindra' }) },
];

const linkClass =
  'whitespace-nowrap text-surface/75 underline-offset-4 hover:text-gold hover:underline';

/** Edge-to-edge അങ്ങാടി set tone-on-tone: the brand name in the language of its buyers. */
function MalayalamWordmark() {
  // Anek Malayalam at 125% width renders this word ~5.4× its font size, so 18cqi fills the container.
  return (
    <div className="mx-auto max-w-[1320px] overflow-hidden px-4 md:px-6" aria-hidden>
      <p
        lang="ml"
        className="@container font-malayalam font-bold whitespace-nowrap text-ink-soft select-none [font-stretch:125%]"
      >
        <span className="-mb-[0.22em] block text-[18cqi] leading-[1.05]">അങ്ങാടി</span>
      </p>
    </div>
  );
}

/** Mast-headed close. The link runs double as SEO discovery paths. */
export function SiteFooter() {
  return (
    <footer className="mt-20 bg-ink text-surface">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 pt-12 pb-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:px-6">
        <div className="space-y-4">
          <Logo inverted />
          <p className="max-w-sm font-display text-2xl leading-tight font-semibold tracking-tight">
            Kerala&apos;s used-car market. Your number stays private until you choose to share it.
          </p>
        </div>
        <div className="space-y-6 text-sm">
          <nav aria-label="Used cars by district">
            <h2 className="mb-2 text-xs font-semibold tracking-[0.12em] text-gold uppercase">
              Used cars by district
            </h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
              {KERALA_DISTRICTS.map(({ name, slug }) => (
                <li key={slug}>
                  <Link href={routes.browse({ districtSlug: slug })} className={linkClass}>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Popular searches">
            <h2 className="mb-2 text-xs font-semibold tracking-[0.12em] text-gold uppercase">
              Popular searches
            </h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
              {POPULAR.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={linkClass}>
                    Used {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-[1320px] px-4 md:px-6">
        <p className="border-t border-surface/15 py-5 text-xs text-surface/60">
          © {new Date().getFullYear()} Angadi Marketplace · angadimarketplace.com
        </p>
      </div>
      <MalayalamWordmark />
    </footer>
  );
}
