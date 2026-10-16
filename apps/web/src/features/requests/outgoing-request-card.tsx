'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { ConnectedActions } from '@/features/contact/connected-actions';
import { contactApi } from '@/lib/api/endpoints/contact';
import { errorMessage } from '@/lib/api/errors';
import type { OutgoingRequest } from '@/lib/api/types';
import { daysUntil } from '@/lib/format';
import { routes } from '@/lib/routes';
import { RequestListingSummary } from './request-listing-summary';

const BUYER_REASON: Record<string, string> = {
  NO_LONGER_AVAILABLE: 'The vehicle is no longer available.',
  NOT_COMFORTABLE_SHARING: 'The seller chose not to share their contact.',
};

/** Buyer's view of a request they sent. */
export function OutgoingRequestCard({ request }: { request: OutgoingRequest }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [cancelling, setCancelling] = useState(false);

  const cancel = async () => {
    setCancelling(true);
    try {
      await contactApi.cancel(request.id);
      toast('Request cancelled');
      await queryClient.invalidateQueries({ queryKey: ['requests'] });
    } catch (error) {
      toast(errorMessage(error), 'error');
    } finally {
      setCancelling(false);
    }
  };

  const message = `Hi, I'm interested in your ${request.listing.title} on Angadi.`;
  return (
    <article className="space-y-3 rounded-card border border-line bg-surface p-4">
      <RequestListingSummary
        listing={request.listing}
        createdAt={request.createdAt}
        status={request.status}
      />
      <p className="border-t border-line pt-3 text-sm">
        Seller: <span className="font-semibold">{request.seller.displayName}</span>
        {request.seller.type === 'DEALER' && <span className="text-gold"> · Dealer</span>}
      </p>

      {request.sellerContact && (
        <ConnectedActions contact={request.sellerContact} who="Seller" message={message} />
      )}

      {request.status === 'PENDING' && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted">Waiting for the seller to respond.</p>
          <Button variant="ghost" size="sm" loading={cancelling} onClick={cancel}>
            Cancel request
          </Button>
        </div>
      )}

      {(request.status === 'REJECTED' || request.status === 'CANCELLED') &&
        !request.isConnected && (
          <div className="space-y-2 text-sm">
            {request.status === 'REJECTED' && (
              <p className="text-muted">
                {BUYER_REASON[request.rejectionReason ?? ''] ?? 'The seller declined this request.'}
              </p>
            )}
            {request.canRequestAgainAt ? (
              <p className="font-medium">
                Request again in {daysUntil(request.canRequestAgainAt)} day
                {daysUntil(request.canRequestAgainAt) === 1 ? '' : 's'}
              </p>
            ) : (
              request.canRequestAgain &&
              request.listing.slug && (
                <Link
                  href={routes.listing(request.listing.slug)}
                  className="inline-flex h-9 items-center rounded-button bg-brand px-3 font-semibold text-white"
                >
                  Request again
                </Link>
              )
            )}
          </div>
        )}
    </article>
  );
}
