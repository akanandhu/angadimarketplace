'use client';

import { useQuery } from '@tanstack/react-query';
import { Flag } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ErrorState, Skeleton } from '@/components/ui/feedback';
import { useAuth } from '@/features/auth/auth-provider';
import { ContactCta } from '@/features/contact/contact-cta';
import { SaveButton } from '@/features/favourites/save-button';
import { track } from '@/lib/analytics';
import { listingsApi } from '@/lib/api/endpoints/listings';
import { errorMessage, isApiError } from '@/lib/api/errors';
import type { ListingDetail, UnavailableListing } from '@/lib/api/types';
import { formatPrice, timeAgo } from '@/lib/format';
import { keys } from '@/lib/query/keys';
import { routes } from '@/lib/routes';
import { Gallery } from './gallery';
import { OwnerActions } from './owner-actions';
import { RelatedListings } from './related-listings';
import { ReportSheet } from './report-sheet';
import { SellerCard } from './seller-card';
import { ShareButton } from './share-button';
import { UnavailableListingState } from './unavailable-listing';
import { ConditionSection, VehicleOverview } from './vehicle-overview';

export function ListingDetailScreen({
  slug,
  initialData,
}: {
  slug: string;
  initialData?: ListingDetail;
}) {
  const { requireAuth } = useAuth();
  const [reporting, setReporting] = useState(false);
  const detail = useQuery({
    queryKey: keys.listing(slug),
    queryFn: () => listingsApi.detail(slug),
    initialData,
  });
  const listing = detail.data;

  useEffect(() => {
    if (!listing?.id) return;
    void listingsApi.recordView(listing.id);
    track('listing_viewed', { listingId: listing.id });
  }, [listing?.id]);

  if (detail.isError) {
    if (isApiError(detail.error, 'LISTING_NOT_ACTIVE')) {
      return <UnavailableListingState info={detail.error.details as UnavailableListing} />;
    }
    if (isApiError(detail.error, 'LISTING_NOT_FOUND')) return <UnavailableListingState />;
    return <ErrorState message={errorMessage(detail.error)} />;
  }
  if (!listing) return <DetailSkeleton />;

  const car = listing.car;
  const price = formatPrice(listing.price);
  const action = listing.isOwner ? (
    <OwnerActions listingId={listing.id} />
  ) : (
    <ContactCta listing={listing} />
  );

  return (
    <div className="mx-auto max-w-[1320px] pb-28 md:px-6 md:py-6 md:pb-6">
      {car && (
        <nav aria-label="Breadcrumb" className="mb-4 hidden text-sm text-muted md:block">
          <Link href="/" className="hover:text-brand">
            Home
          </Link>{' '}
          /{' '}
          <Link href={routes.browse()} className="hover:text-brand">
            Cars
          </Link>{' '}
          /{' '}
          <Link href={routes.browse({ brandSlug: car.brand.slug })} className="hover:text-brand">
            {car.brand.name}
          </Link>{' '}
          /{' '}
          <Link
            href={routes.browse({ brandSlug: car.brand.slug, modelSlug: car.model.slug })}
            className="hover:text-brand"
          >
            {car.model.name}
          </Link>
        </nav>
      )}

      <div className="md:grid md:grid-cols-[minmax(0,1fr)_380px] md:gap-8">
        <div className="space-y-4">
          <Gallery images={listing.images} title={listing.title} />

          <div className="space-y-3 px-4 md:hidden">
            <Summary listing={listing} price={price} />
          </div>

          <div className="space-y-4 px-4 md:px-0">
            {car && <VehicleOverview car={car} />}
            <div className="rounded-card border border-line bg-surface p-4 md:hidden">
              <SellerCard seller={listing.seller} />
            </div>
            {listing.description && (
              <section
                aria-labelledby="description-heading"
                className="rounded-card border border-line bg-surface p-4"
              >
                <h2 id="description-heading" className="mb-2 font-semibold">
                  Description
                </h2>
                <p className="text-sm whitespace-pre-line text-ink-soft">{listing.description}</p>
              </section>
            )}
            {car && <ConditionSection car={car} />}
            {!listing.isOwner && (
              <button
                type="button"
                onClick={() => requireAuth(() => setReporting(true))}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-danger"
              >
                <Flag className="size-4" aria-hidden /> Report this listing
              </button>
            )}
          </div>
        </div>

        <aside className="hidden md:block">
          <div className="sticky top-20 space-y-4 rounded-card border border-line bg-surface p-5 shadow-card">
            <Summary listing={listing} price={price} />
            <div className="border-t border-line pt-4">
              <SellerCard seller={listing.seller} />
            </div>
            {action}
          </div>
        </aside>
      </div>

      <div className="mt-10 px-4 md:px-0">
        <RelatedListings listing={listing} />
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface px-4 pt-3 pb-3 md:hidden">
        {action}
      </div>
      <ReportSheet listingId={listing.id} open={reporting} onClose={() => setReporting(false)} />
    </div>
  );
}

function Summary({ listing, price }: { listing: ListingDetail; price: string }) {
  return (
    <>
      <div>
        <p className="text-2xl font-extrabold md:text-3xl">{price}</p>
        {listing.isNegotiable && <p className="text-sm font-medium text-brand">Negotiable</p>}
        <h1 className="mt-1 text-lg font-semibold">{listing.title}</h1>
        <p className="text-sm text-muted">
          {listing.district?.name} · Posted {timeAgo(listing.publishedAt)}
        </p>
      </div>
      <div className="flex gap-2">
        <SaveButton listingId={listing.id} saved={listing.isSaved} variant="inline" />
        <ShareButton slug={listing.slug} title={listing.title} price={price} />
      </div>
    </>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] space-y-4 md:grid md:grid-cols-[1fr_380px] md:gap-8 md:p-6">
      <Skeleton className="aspect-[4/3] w-full md:rounded-card" />
      <div className="space-y-3 px-4 md:px-0">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-5 w-64" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
