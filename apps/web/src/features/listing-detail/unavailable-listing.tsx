import { CarFront } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/feedback';
import type { UnavailableListing } from '@/lib/api/types';
import { routes } from '@/lib/routes';

/** Friendly state for old/shared links to sold or removed listings. */
export function UnavailableListingState({ info }: { info?: UnavailableListing }) {
  const similar = routes.browse({
    brandSlug: info?.brandSlug ?? undefined,
    modelSlug: info?.modelSlug ?? undefined,
  });
  return (
    <EmptyState
      icon={CarFront}
      title={info?.status === 'SOLD' ? 'This car has been sold' : 'This car is no longer available'}
      description="The seller is no longer accepting enquiries for this listing."
      action={
        <Link
          href={similar}
          className="inline-flex h-11 items-center rounded-button bg-brand px-5 text-sm font-semibold text-white"
        >
          Browse similar cars
        </Link>
      }
    />
  );
}
