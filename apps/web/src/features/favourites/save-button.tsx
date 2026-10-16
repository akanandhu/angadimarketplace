'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/toast';
import { favouritesApi } from '@/lib/api/endpoints/listings';
import { errorMessage } from '@/lib/api/errors';
import { cn } from '@/lib/cn';
import { keys } from '@/lib/query/keys';
import { useAuth } from '../auth/auth-provider';

interface Props {
  listingId: string;
  saved: boolean;
  variant?: 'overlay' | 'inline';
  className?: string;
}

/** Optimistic save toggle. Visitors are asked to log in first, then the save completes. */
export function SaveButton({ listingId, saved, variant = 'overlay', className }: Props) {
  const { requireAuth } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [isSaved, setIsSaved] = useState(saved);
  useEffect(() => setIsSaved(saved), [saved]);

  const toggle = (next: boolean) => {
    setIsSaved(next);
    (next ? favouritesApi.save(listingId) : favouritesApi.remove(listingId))
      .then(() => queryClient.invalidateQueries({ queryKey: keys.favourites }))
      .catch((error) => {
        setIsSaved(!next);
        toast(errorMessage(error), 'error');
      });
  };

  const onClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    requireAuth(() => toggle(!isSaved));
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSaved}
      aria-label={isSaved ? 'Remove from saved' : 'Save'}
      className={cn(
        variant === 'overlay'
          ? 'flex size-9 items-center justify-center rounded-full bg-surface/90 shadow-card hover:bg-surface'
          : 'flex items-center gap-1.5 rounded-button border border-line-strong px-3 py-2 text-sm font-semibold hover:bg-canvas',
        className,
      )}
    >
      <Heart
        className={cn('size-[18px]', isSaved ? 'fill-danger text-danger' : 'text-ink')}
        aria-hidden
      />
      {variant === 'inline' && (isSaved ? 'Saved' : 'Save')}
    </button>
  );
}
