import { BadgeCheck, Store, User } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/feedback';
import type { PublicSeller } from '@/lib/api/types';
import { memberSince } from '@/lib/format';
import { routes } from '@/lib/routes';

/** Public seller identity. Never shows a phone number. */
export function SellerCard({ seller }: { seller: PublicSeller }) {
  const isDealer = seller.type === 'DEALER';
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold-soft text-ink">
        {seller.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={seller.logoUrl} alt="" className="size-full object-cover" />
        ) : isDealer ? (
          <Store className="size-5" aria-hidden />
        ) : (
          <User className="size-5" aria-hidden />
        )}
      </div>
      <div className="min-w-0 space-y-0.5">
        <p className="flex flex-wrap items-center gap-2 font-semibold">
          {seller.displayName}
          {isDealer ? (
            <Badge tone="gold">
              <BadgeCheck className="size-3" aria-hidden /> Dealer
            </Badge>
          ) : (
            <span className="text-xs font-normal text-muted">Individual seller</span>
          )}
        </p>
        <p className="text-sm text-muted">
          {[seller.district?.name, `Member since ${memberSince(seller.memberSince)}`]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {isDealer && seller.activeListingCount != null && (
          <p className="text-sm text-muted">{seller.activeListingCount} active listings</p>
        )}
        {isDealer && seller.dealerSlug && (
          <Link
            href={routes.dealer(seller.dealerSlug)}
            className="inline-block pt-1 text-sm font-semibold text-brand"
          >
            View dealer profile
          </Link>
        )}
      </div>
    </div>
  );
}
