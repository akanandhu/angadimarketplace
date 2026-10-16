import Link from 'next/link';
import { Badge, Skeleton } from '@/components/ui/feedback';
import type { ListingCard as Card } from '@/lib/api/types';
import { formatKm, formatPrice, label, timeAgo } from '@/lib/format';
import { routes } from '@/lib/routes';
import { SaveButton } from '../favourites/save-button';
import { CarImage } from './car-image';

interface Props {
  listing: Card;
  /** Favourites history shows sold/removed listings in an unavailable state. */
  unavailable?: boolean;
  eager?: boolean;
}

export function ListingCard({ listing, unavailable, eager }: Props) {
  const car = listing.car;
  const specs = car ? [formatKm(car.kmDriven), label(car.fuelType), label(car.transmission)] : [];
  return (
    <article className="group relative overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow hover:shadow-raised">
      <Link
        href={routes.listing(listing.slug)}
        className="flex focus-visible:outline-offset-[-2px] min-[480px]:block"
      >
        <div className="relative aspect-[4/3] w-[42%] shrink-0 min-[480px]:w-auto">
          <CarImage
            src={listing.coverImage?.card}
            alt={listing.title}
            eager={eager}
            className="size-full"
          />
          {unavailable && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/55">
              <Badge tone="ink">{listing.status === 'SOLD' ? 'SOLD' : 'NO LONGER AVAILABLE'}</Badge>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1 p-3 pr-11 min-[480px]:pr-3">
          <p className="text-base font-bold min-[480px]:text-lg">{formatPrice(listing.price)}</p>
          <h3 className="line-clamp-2 text-sm font-medium min-[480px]:truncate min-[480px]:text-[15px]">{listing.title}</h3>
          <p className="truncate text-xs text-muted min-[480px]:text-sm">{specs.join(' · ')}</p>
          <div className="flex items-center justify-between gap-2 pt-1 text-xs text-muted">
            <span className="truncate">{listing.district?.name}</span>
            <span className="shrink-0">{timeAgo(listing.publishedAt)}</span>
          </div>
          {listing.seller.type === 'DEALER' && (
            <p className="truncate border-t border-line pt-2 text-xs font-medium text-ink">
              {listing.seller.displayName} · <span className="text-gold">Dealer</span>
            </p>
          )}
        </div>
      </Link>
      {!unavailable && (
        <SaveButton listingId={listing.id} saved={listing.isSaved} className="absolute top-2 right-2" />
      )}
    </article>
  );
}

export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}

export function ListingGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 min-[480px]:gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {children}
    </div>
  );
}
