'use client';

import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Gallery } from '@/features/listing-detail/gallery';
import { ConditionSection, VehicleOverview } from '@/features/listing-detail/vehicle-overview';
import { track } from '@/lib/analytics';
import { sellerApi } from '@/lib/api/endpoints/seller';
import { errorMessage, isApiError } from '@/lib/api/errors';
import type { ListingStep, SellerListing } from '@/lib/api/types';
import { formatPrice } from '@/lib/format';
import { StepFooter } from '../step-footer';
import type { StepProps } from '../step-props';

const STEP_FOR: Record<ListingStep, { index: number; label: string }> = {
  vehicle: { index: 0, label: 'Add vehicle and registration details' },
  price: { index: 2, label: 'Set an expected price' },
  district: { index: 3, label: 'Choose a district' },
  photos: { index: 4, label: 'Add at least one photo' },
  profile: { index: -1, label: 'Add your name in your profile' },
};

export function previewTitle(listing: SellerListing) {
  const car = listing.car;
  return (
    listing.title ??
    (car
      ? `${car.manufacturingYear} ${car.brand.name} ${car.model.name} ${car.variant ?? ''}`.trim()
      : 'Your car')
  );
}

/** Step 7. Close approximation of the public page, then publish. */
export function PreviewStep({
  listing,
  onSaved,
  back,
  goTo,
  onPublished,
}: StepProps & { goTo: (step: number) => void; onPublished: () => void }) {
  const [error, setError] = useState<string>();
  const [publishing, setPublishing] = useState(false);
  const isDraft = listing.status === 'DRAFT';
  const images = listing.images
    .filter((i) => i.status === 'READY' && i.urls)
    .map((i) => ({ id: i.id, width: null, height: null, urls: i.urls! }));

  const publish = async () => {
    if (!isDraft) return onPublished();
    setPublishing(true);
    setError(undefined);
    try {
      onSaved(await sellerApi.publish(listing.id));
      track('listing_published', { listingId: listing.id });
      onPublished();
    } catch (err) {
      setError(
        isApiError(err, 'LISTING_NOT_READY')
          ? 'Some details are still missing.'
          : errorMessage(err),
      );
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-5">
      {listing.missingSteps.length > 0 && (
        <div
          role="alert"
          className="space-y-2 rounded-card border border-warning/30 bg-warning-soft p-4"
        >
          <p className="flex items-center gap-2 text-sm font-semibold text-warning">
            <AlertCircle className="size-4" aria-hidden /> Before you publish
          </p>
          <ul className="space-y-1 text-sm">
            {listing.missingSteps.map((step) => (
              <li key={step}>
                {STEP_FOR[step].index >= 0 ? (
                  <button
                    type="button"
                    onClick={() => goTo(STEP_FOR[step].index)}
                    className="font-medium text-brand underline"
                  >
                    {STEP_FOR[step].label}
                  </button>
                ) : (
                  STEP_FOR[step].label
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="overflow-hidden rounded-card border border-line bg-surface">
        <Gallery images={images} title={previewTitle(listing)} />
        <div className="space-y-1 p-4">
          <p className="text-2xl font-bold">{formatPrice(listing.price)}</p>
          {listing.isNegotiable && <p className="text-sm font-medium text-brand">Negotiable</p>}
          <h2 className="text-lg font-semibold">{previewTitle(listing)}</h2>
          <p className="text-sm text-muted">{listing.district?.name ?? 'District not set'}</p>
        </div>
      </div>
      {listing.car && <VehicleOverview car={listing.car} />}
      {listing.description && (
        <section className="rounded-card border border-line bg-surface p-4">
          <h2 className="mb-2 font-semibold">Description</h2>
          <p className="text-sm whitespace-pre-line">{listing.description}</p>
        </section>
      )}
      {listing.car && <ConditionSection car={listing.car} />}

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <StepFooter
        onBack={back}
        onSubmit={publish}
        loading={publishing}
        loadingText="Publishing..."
        disabled={isDraft && listing.missingSteps.length > 0}
        submitLabel={isDraft ? 'Publish listing' : 'Done'}
      />
    </div>
  );
}
