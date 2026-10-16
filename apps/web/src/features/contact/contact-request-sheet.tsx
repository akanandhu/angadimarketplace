'use client';

import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/toggle';
import { Sheet } from '@/components/ui/sheet';
import { CarImage } from '@/features/listings/car-image';
import { track } from '@/lib/analytics';
import { contactApi } from '@/lib/api/endpoints/contact';
import { errorMessage } from '@/lib/api/errors';
import type { ListingDetail } from '@/lib/api/types';
import { formatPrice } from '@/lib/format';
import { keys } from '@/lib/query/keys';
import { useAuth } from '../auth/auth-provider';

interface Props {
  listing: ListingDetail;
  open: boolean;
  onClose: () => void;
}

/** Sends a listing-specific request. The only phone that can be shared is the verified one. */
export function ContactRequestSheet({ listing, open, onClose }: Props) {
  const { me } = useAuth();
  const queryClient = useQueryClient();
  const [allow, setAllow] = useState(me?.defaultAllowSellerContact ?? false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setAllow(me?.defaultAllowSellerContact ?? false);
      setSent(false);
      setError(undefined);
    }
  }, [open, me?.defaultAllowSellerContact]);

  const send = async () => {
    setLoading(true);
    setError(undefined);
    try {
      await contactApi.request(listing.id, allow);
      setSent(true);
      track('contact_request_sent', { listingId: listing.id, allowSellerToContact: allow });
      void queryClient.invalidateQueries({
        queryKey: keys.contactState(listing.seller.id, listing.id),
      });
      void queryClient.invalidateQueries({ queryKey: ['requests'] });
      void queryClient.invalidateQueries({ queryKey: keys.me });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <Sheet
        open={open}
        onClose={onClose}
        title="Request sent"
        footer={
          <Button block onClick={onClose}>
            Done
          </Button>
        }
      >
        <div className="flex flex-col items-center py-4 text-center">
          <CheckCircle2 className="size-12 text-success" aria-hidden />
          <p className="mt-3 font-semibold">Request sent</p>
          <p className="mt-1 text-sm text-muted">We&apos;ll notify you when the seller responds.</p>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Request seller contact"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button block loading={loading} loadingText="Sending..." onClick={send}>
            Send request
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div className="flex gap-3 rounded-card border border-line p-3">
          <CarImage
            src={listing.images[0]?.urls.thumb}
            alt=""
            className="h-16 w-20 shrink-0 rounded-md"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{listing.title}</p>
            <p className="text-sm font-bold">{formatPrice(listing.price)}</p>
          </div>
        </div>
        <p className="text-sm">
          You&apos;re requesting contact access from{' '}
          <span className="font-semibold">{listing.seller.displayName}</span>.
        </p>
        <div className="space-y-1.5 rounded-card bg-canvas p-3">
          <Checkbox
            id="allow-seller-contact"
            checked={allow}
            onChange={setAllow}
            label="Allow this seller to contact me using my verified phone number"
          />
          <p className="pl-8 text-xs text-muted">You can change this for each request.</p>
        </div>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </Sheet>
  );
}
