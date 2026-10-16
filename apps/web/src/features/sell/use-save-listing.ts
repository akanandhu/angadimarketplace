'use client';

import { useState } from 'react';
import { ListingPatch, sellerApi } from '@/lib/api/endpoints/seller';
import { errorMessage } from '@/lib/api/errors';
import type { StepProps } from './step-props';

/** PATCHes the draft and advances; exposes loading/error for the step UI. */
export function useSaveListing({ listing, onSaved, next }: StepProps) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>();

  const save = async (patch: ListingPatch) => {
    setSaving(true);
    setError(undefined);
    try {
      onSaved(await sellerApi.update(listing.id, patch));
      next();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return { save, saving, error };
}
