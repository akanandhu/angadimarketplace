'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Car, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { sellerApi } from '@/lib/api/endpoints/seller';
import { errorMessage } from '@/lib/api/errors';
import { timeAgo } from '@/lib/format';
import { keys } from '@/lib/query/keys';
import { routes } from '@/lib/routes';
import { previewTitle } from './steps/preview-step';

/** Start a new listing or continue a saved draft. */
export function SellIntro() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [creating, setCreating] = useState(false);
  const drafts = useQuery({
    queryKey: keys.myListings('DRAFT'),
    queryFn: () => sellerApi.list('DRAFT'),
  });

  const start = async () => {
    setCreating(true);
    try {
      const draft = await sellerApi.createDraft();
      queryClient.setQueryData(keys.myListing(draft.id), draft);
      router.replace(routes.sell(draft.id));
    } catch (error) {
      toast(errorMessage(error), 'error');
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl space-y-6 px-4 py-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Sell your car</h1>
        <p className="text-sm text-muted">
          Free listing, live as soon as you publish. Your phone number stays private — you decide
          who gets it.
        </p>
      </div>
      <Button size="lg" block loading={creating} loadingText="Starting..." onClick={start}>
        <Car className="size-5" aria-hidden /> Start a new listing
      </Button>

      {!!drafts.data?.data.length && (
        <section aria-labelledby="drafts-heading" className="space-y-2">
          <h2 id="drafts-heading" className="font-semibold">
            Continue a draft
          </h2>
          <ul className="divide-y divide-line rounded-card border border-line bg-surface">
            {drafts.data.data.map((draft) => (
              <li key={draft.id}>
                <Link
                  href={routes.sell(draft.id)}
                  className="flex items-center justify-between gap-3 p-4 hover:bg-canvas"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {draft.car ? previewTitle(draft) : 'Untitled draft'}
                    </p>
                    <p className="text-xs text-muted">Updated {timeAgo(draft.updatedAt)}</p>
                  </div>
                  <ChevronRight className="size-4 text-muted" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
