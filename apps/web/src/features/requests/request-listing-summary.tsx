import Link from 'next/link';
import { StatusBadge } from '@/components/ui/feedback';
import { CarImage } from '@/features/listings/car-image';
import type { IncomingRequest } from '@/lib/api/types';
import { formatPrice, timeAgo } from '@/lib/format';
import { routes } from '@/lib/routes';

export function RequestListingSummary({
  listing,
  createdAt,
  status,
}: {
  listing: IncomingRequest['listing'];
  createdAt: string;
  status: string;
}) {
  const body = (
    <div className="flex min-w-0 gap-3">
      <CarImage src={listing.thumbnailUrl} alt="" className="h-14 w-18 shrink-0 rounded-md" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{listing.title}</p>
        <p className="text-sm">{formatPrice(listing.price)}</p>
        <p className="text-xs text-muted">Requested {timeAgo(createdAt)}</p>
      </div>
    </div>
  );
  return (
    <div className="flex items-start justify-between gap-3">
      {listing.slug && listing.status === 'ACTIVE' ? (
        <Link href={routes.listing(listing.slug)}>{body}</Link>
      ) : (
        body
      )}
      <StatusBadge status={status} />
    </div>
  );
}
