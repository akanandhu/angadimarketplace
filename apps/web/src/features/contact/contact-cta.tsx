'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Clock, Lock } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { track } from '@/lib/analytics';
import { contactApi } from '@/lib/api/endpoints/contact';
import type { ContactState, ListingDetail } from '@/lib/api/types';
import { daysUntil } from '@/lib/format';
import { keys } from '@/lib/query/keys';
import { useAuth } from '../auth/auth-provider';
import { ConnectedActions } from './connected-actions';
import { ContactRequestSheet } from './contact-request-sheet';
import { useContactState } from './use-contact-state';

function Note({ icon: Icon, title, text }: { icon: typeof Clock; title: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-button border border-line bg-canvas px-3 py-2.5">
      <Icon className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted">{text}</p>
      </div>
    </div>
  );
}

/**
 * Contact area for a listing: request / pending / cooldown / connected states.
 * Owners never see it (they get management actions instead).
 */
export function ContactCta({ listing }: { listing: ListingDetail }) {
  const { status, requireAuth } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const state = useContactState(listing.seller.id, listing.id, !listing.isOwner);
  const message = `Hi, I'm interested in your ${listing.title} on Angadi.`;

  // After a just-in-time login the state is fetched before deciding what to show.
  const start = () =>
    requireAuth(async () => {
      const fresh = await queryClient.fetchQuery<ContactState>({
        queryKey: keys.contactState(listing.seller.id, listing.id),
        queryFn: () => contactApi.state(listing.seller.id, listing.id),
      });
      if (fresh.state === 'NOT_CONNECTED' && fresh.canRequest) {
        track('contact_request_started', { listingId: listing.id });
        setSheetOpen(true);
      } else if (fresh.state === 'CONNECTED')
        toast('You are already connected with this seller', 'info');
    });

  const data = status === 'authenticated' ? state.data : undefined;
  let content: React.ReactNode;

  if (data?.state === 'CONNECTED') {
    content = <ConnectedActions contact={data.sellerContact} who="Seller" message={message} />;
  } else if (data?.state === 'NOT_CONNECTED' && data.listingRequest?.status === 'PENDING') {
    content = (
      <>
        <Button block size="lg" variant="outline" disabled>
          Request sent
        </Button>
        <p className="text-center text-xs text-muted">Waiting for the seller to respond.</p>
      </>
    );
  } else if (data?.state === 'NOT_CONNECTED' && data.listingRequest?.canRequestAgainAt) {
    const days = daysUntil(data.listingRequest.canRequestAgainAt);
    content = (
      <Note
        icon={Clock}
        title="Request declined"
        text={`You can request again in ${days} day${days === 1 ? '' : 's'}.`}
      />
    );
  } else {
    const again = data?.state === 'NOT_CONNECTED' && data.listingRequest;
    content = (
      <>
        <Button
          block
          size="lg"
          onClick={start}
          loading={status === 'authenticated' && state.isLoading}
        >
          {again ? 'Request contact again' : 'Request contact'}
        </Button>
        <p className="flex items-center justify-center gap-1 text-center text-xs text-muted">
          <Lock className="size-3" aria-hidden /> The seller&apos;s number is shared only if they
          approve.
        </p>
      </>
    );
  }

  return (
    <div className="space-y-2">
      {content}
      <ContactRequestSheet listing={listing} open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  );
}
