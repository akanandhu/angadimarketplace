'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { track } from '@/lib/analytics';
import { sellerApi } from '@/lib/api/endpoints/seller';
import { errorMessage } from '@/lib/api/errors';

interface Props {
  listingId: string;
  open: boolean;
  onClose: () => void;
  onDone?: () => void;
}

/** Sold is not deletion: the listing leaves search but its history is kept. */
export function MarkSoldDialog({ listingId, open, onClose, onDone }: Props) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    try {
      await sellerApi.markSold(listingId);
      track('listing_marked_sold', { listingId });
      await queryClient.invalidateQueries({ queryKey: ['my-listings'] });
      await queryClient.invalidateQueries({ queryKey: ['listings'] });
      toast('Marked as sold');
      onClose();
      onDone?.();
    } catch (error) {
      toast(errorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Mark this vehicle as sold?"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button block variant="secondary" loading={loading} onClick={confirm}>
            Mark as sold
          </Button>
        </>
      }
    >
      <p className="text-sm text-muted">
        It will be removed from public search and will no longer accept new contact requests.
      </p>
    </Sheet>
  );
}
