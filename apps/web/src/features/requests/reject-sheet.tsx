'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/field';
import { Sheet } from '@/components/ui/sheet';
import type { RejectionReason } from '@/lib/api/types';

export const REJECTION_LABELS: Record<RejectionReason, string> = {
  NO_LONGER_AVAILABLE: 'Vehicle is no longer available',
  NOT_COMFORTABLE_SHARING: "I don't want to share my contact",
  SUSPECTED_SPAM: 'Suspected spam',
  OTHER: 'Other',
};

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: RejectionReason, note?: string) => Promise<void>;
}

export function RejectSheet({ open, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState<RejectionReason>();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    if (!reason) return;
    setLoading(true);
    try {
      await onConfirm(reason, reason === 'OTHER' ? note.trim() || undefined : undefined);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Why are you declining this request?"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button block variant="danger" disabled={!reason} loading={loading} onClick={confirm}>
            Decline request
          </Button>
        </>
      }
    >
      <fieldset className="space-y-2">
        <legend className="sr-only">Reason</legend>
        {(Object.keys(REJECTION_LABELS) as RejectionReason[]).map((value) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-3 rounded-input border border-line px-3 py-3 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-soft"
          >
            <input
              type="radio"
              name="reject-reason"
              checked={reason === value}
              onChange={() => setReason(value)}
              className="accent-brand"
            />
            {REJECTION_LABELS[value]}
          </label>
        ))}
      </fieldset>
      {reason === 'OTHER' && (
        <Field label="Note" htmlFor="reject-note" optional className="mt-4">
          <Textarea
            id="reject-note"
            value={note}
            maxLength={300}
            onChange={(e) => setNote(e.target.value)}
            className="min-h-20"
          />
        </Field>
      )}
    </Sheet>
  );
}
