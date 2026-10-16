'use client';

import { CheckCircle2, MessageSquareText, Pencil } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MarkSoldDialog } from '@/features/my-listings/mark-sold-dialog';
import { routes } from '@/lib/routes';

/** Shown instead of the contact CTA when the viewer owns the listing. */
export function OwnerActions({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const item =
    'flex h-11 flex-1 items-center justify-center gap-1.5 rounded-button border border-line-strong bg-surface text-sm font-semibold hover:bg-canvas';
  return (
    <div className="space-y-2">
      <p className="text-center text-xs font-medium text-muted">This is your listing</p>
      <div className="flex gap-2">
        <Link href={routes.sell(listingId)} className={item}>
          <Pencil className="size-4" aria-hidden /> Edit
        </Link>
        <Link href={routes.requests('received')} className={item}>
          <MessageSquareText className="size-4" aria-hidden /> Requests
        </Link>
        <button type="button" className={item} onClick={() => setConfirming(true)}>
          <CheckCircle2 className="size-4" aria-hidden /> Sold
        </button>
      </div>
      <MarkSoldDialog
        listingId={listingId}
        open={confirming}
        onClose={() => setConfirming(false)}
        onDone={() => router.push(routes.myListings('SOLD'))}
      />
    </div>
  );
}
