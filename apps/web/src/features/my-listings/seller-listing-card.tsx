'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/feedback';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { ShareButton } from '@/features/listing-detail/share-button';
import { CarImage } from '@/features/listings/car-image';
import { previewTitle } from '@/features/sell/steps/preview-step';
import { sellerApi } from '@/lib/api/endpoints/seller';
import { errorMessage } from '@/lib/api/errors';
import type { SellerListing } from '@/lib/api/types';
import { formatPrice, timeAgo } from '@/lib/format';
import { routes } from '@/lib/routes';
import { ListingMetrics } from './listing-metrics';
import { MarkSoldDialog } from './mark-sold-dialog';

type Confirm = 'sold' | 'remove' | 'delete' | null;

export function SellerListingCard({ listing }: { listing: SellerListing }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [busy, setBusy] = useState(false);
  const title = previewTitle(listing);

  const run = async (action: () => Promise<unknown>, message: string) => {
    setBusy(true);
    try {
      await action();
      toast(message);
      setConfirm(null);
      await queryClient.invalidateQueries({ queryKey: ['my-listings'] });
    } catch (error) {
      toast(errorMessage(error), 'error');
    } finally {
      setBusy(false);
    }
  };

  const age =
    listing.status === 'DRAFT'
      ? `Draft updated ${timeAgo(listing.updatedAt)}`
      : listing.status === 'SOLD'
        ? `Sold ${timeAgo(listing.soldAt)}`
        : `Posted ${timeAgo(listing.publishedAt)}`;
  const link =
    'inline-flex h-9 items-center rounded-button border border-line-strong px-3 text-sm font-semibold hover:bg-canvas';

  return (
    <article className="space-y-3 rounded-card border border-line bg-surface p-4">
      <div className="flex gap-3">
        <CarImage
          src={listing.coverImage?.thumb}
          alt=""
          className="h-20 w-28 shrink-0 rounded-md"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-semibold">{title}</h3>
            <StatusBadge status={listing.status} />
          </div>
          <p className="font-bold">{formatPrice(listing.price)}</p>
          <p className="text-xs text-muted">{age}</p>
          {listing.status === 'REMOVED' && listing.removalReason && (
            <p className="mt-1 text-xs text-danger">Reason: {listing.removalReason}</p>
          )}
        </div>
      </div>

      {(listing.status === 'ACTIVE' || listing.status === 'SOLD') && (
        <ListingMetrics stats={listing.stats} />
      )}

      <div className="flex flex-wrap gap-2">
        {listing.status === 'DRAFT' && (
          <>
            <Link
              href={routes.sell(listing.id)}
              className={`${link} border-ink bg-ink text-surface hover:bg-ink-soft`}
            >
              Continue editing
            </Link>
            <button
              type="button"
              className={`${link} text-danger`}
              onClick={() => setConfirm('delete')}
            >
              Delete draft
            </button>
          </>
        )}
        {listing.status === 'ACTIVE' && listing.slug && (
          <>
            <Link href={routes.sell(listing.id)} className={link}>
              Edit
            </Link>
            <Link href={routes.requests('received')} className={link}>
              View requests
            </Link>
            <ShareButton slug={listing.slug} title={title} price={formatPrice(listing.price)} />
            <button type="button" className={link} onClick={() => setConfirm('sold')}>
              Mark sold
            </button>
            <button
              type="button"
              className={`${link} text-danger`}
              onClick={() => setConfirm('remove')}
            >
              Remove
            </button>
          </>
        )}
      </div>

      <MarkSoldDialog
        listingId={listing.id}
        open={confirm === 'sold'}
        onClose={() => setConfirm(null)}
      />
      <Sheet
        open={confirm === 'remove' || confirm === 'delete'}
        onClose={() => setConfirm(null)}
        title={confirm === 'delete' ? 'Delete this draft?' : 'Remove this listing?'}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirm(null)}>
              Cancel
            </Button>
            <Button
              block
              variant="danger"
              loading={busy}
              onClick={() =>
                confirm === 'delete'
                  ? run(() => sellerApi.deleteDraft(listing.id), 'Draft deleted')
                  : run(() => sellerApi.remove(listing.id), 'Listing removed')
              }
            >
              {confirm === 'delete' ? 'Delete draft' : 'Remove listing'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          {confirm === 'delete'
            ? 'The draft and its photos will be deleted.'
            : 'It will no longer appear on Angadi. If it was sold, use “Mark sold” instead.'}
        </p>
      </Sheet>
    </article>
  );
}
