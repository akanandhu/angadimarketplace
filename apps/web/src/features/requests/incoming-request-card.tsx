'use client';

import { useQueryClient } from '@tanstack/react-query';
import { PhoneOff, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { ConnectedActions } from '@/features/contact/connected-actions';
import { contactApi } from '@/lib/api/endpoints/contact';
import { errorMessage } from '@/lib/api/errors';
import type { IncomingRequest } from '@/lib/api/types';
import { memberSince } from '@/lib/format';
import { RejectSheet, REJECTION_LABELS } from './reject-sheet';
import { RequestListingSummary } from './request-listing-summary';

/** Seller's view of one buyer request. */
export function IncomingRequestCard({ request }: { request: IncomingRequest }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const buyer = request.buyer;
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['requests'] });

  const approve = async () => {
    setLoading(true);
    try {
      await contactApi.approve(request.id);
      toast('Contact shared');
      setApproving(false);
      await refresh();
    } catch (error) {
      toast(errorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const reject = async (reason: Parameters<typeof contactApi.reject>[1], note?: string) => {
    try {
      await contactApi.reject(request.id, reason, note);
      toast('Request declined');
      setRejecting(false);
      await refresh();
    } catch (error) {
      toast(errorMessage(error), 'error');
    }
  };

  return (
    <article className="space-y-3 rounded-card border border-line bg-surface p-4">
      <RequestListingSummary
        listing={request.listing}
        createdAt={request.createdAt}
        status={request.status}
      />
      <div className="border-t border-line pt-3">
        <p className="font-semibold">{buyer.name}</p>
        <p className="text-sm text-muted">
          {[buyer.district?.name, `Member since ${memberSince(buyer.memberSince)}`]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>

      {request.buyerContact ? (
        <div className="space-y-2 rounded-button bg-success-soft p-3">
          <p className="flex items-center gap-1.5 text-sm font-medium text-success">
            <ShieldCheck className="size-4" aria-hidden /> Buyer has allowed you to contact them
          </p>
          <ConnectedActions contact={request.buyerContact} who="Buyer" />
        </div>
      ) : (
        request.status === 'PENDING' && (
          <p className="flex items-center gap-1.5 text-sm text-muted">
            <PhoneOff className="size-4" aria-hidden /> Buyer has not shared their phone number.
          </p>
        )
      )}

      {request.status === 'APPROVED' && (
        <p className="text-sm text-muted">
          Your contact is shared. {buyer.name} can reach you about any of your active listings.
        </p>
      )}

      {request.status === 'REJECTED' && request.rejectionReason && (
        <p className="text-sm text-muted">Declined: {REJECTION_LABELS[request.rejectionReason]}</p>
      )}

      {request.status === 'PENDING' && (
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setRejecting(true)}>
            Decline
          </Button>
          <Button className="flex-[2]" onClick={() => setApproving(true)}>
            Share my contact
          </Button>
        </div>
      )}

      <Sheet
        open={approving}
        onClose={() => setApproving(false)}
        title={`Share your verified phone number with ${buyer.name}?`}
        footer={
          <>
            <Button variant="outline" onClick={() => setApproving(false)}>
              Cancel
            </Button>
            <Button block loading={loading} loadingText="Sharing..." onClick={approve}>
              Share contact
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">
          Once approved, {buyer.name} can contact you regarding your other active listings as well.
        </p>
      </Sheet>
      <RejectSheet open={rejecting} onClose={() => setRejecting(false)} onConfirm={reject} />
    </article>
  );
}
