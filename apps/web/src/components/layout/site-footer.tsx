import Link from 'next/link';
import { routes } from '@/lib/routes';
import { Logo } from './logo';

const POPULAR = [
  { label: 'Used cars in Ernakulam', href: routes.browse({ districtSlug: 'ernakulam' }) },
  { label: 'Used cars in Thiruvananthapuram', href: routes.browse({ districtSlug: 'thiruvananthapuram' }) },
  { label: 'Used cars in Kozhikode', href: routes.browse({ districtSlug: 'kozhikode' }) },
  { label: 'Used Maruti Suzuki cars', href: routes.browse({ brandSlug: 'maruti-suzuki' }) },
  { label: 'Used Hyundai cars', href: routes.browse({ brandSlug: 'hyundai' }) },
  { label: 'Used Toyota Innova Crysta', href: routes.browse({ brandSlug: 'toyota', modelSlug: 'innova-crysta' }) },
];

/** Internal links double as SEO discovery paths. */
export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="mx-auto grid max-w-[1320px] gap-8 px-4 py-10 md:grid-cols-3 md:px-6">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted">
            Kerala&apos;s local marketplace for second-hand cars. Sell locally. Buy confidently.
          </p>
        </div>
        <nav aria-label="Popular searches" className="md:col-span-2">
          <h2 className="mb-3 text-sm font-semibold">Popular searches</h2>
          <ul className="grid gap-2 text-sm text-muted sm:grid-cols-2">
            {POPULAR.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-brand">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="border-t border-line px-4 py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Angadi Marketplace · angadimarketplace.com
      </p>
    </footer>
  );
}
