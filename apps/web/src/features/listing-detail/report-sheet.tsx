'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/field';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { listingsApi } from '@/lib/api/endpoints/listings';
import { errorMessage } from '@/lib/api/errors';

const REASONS = [
  ['FAKE', 'Fake listing'],
  ['SUSPECTED_SCAM', 'Suspected scam'],
  ['INCORRECT_INFORMATION', 'Incorrect information'],
  ['DUPLICATE', 'Duplicate'],
  ['ALREADY_SOLD', 'Already sold'],
  ['INAPPROPRIATE', 'Inappropriate content'],
  ['OTHER', 'Other'],
] as const;

export function ReportSheet({
  listingId,
  open,
  onClose,
}: {
  listingId: string;
  open: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  const [reason, setReason] = useState<string>();
  const [details, setDetails] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!reason) return;
    setLoading(true);
    try {
      await listingsApi.report(listingId, reason, details.trim() || undefined);
      toast("Thanks for reporting this listing. We'll review it.");
      onClose();
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
      title="Report listing"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            block
            disabled={!reason}
            loading={loading}
            loadingText="Sending..."
            onClick={submit}
          >
            Submit report
          </Button>
        </>
      }
    >
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">What&apos;s wrong with this listing?</legend>
        {REASONS.map(([value, text]) => (
          <label
            key={value}
            className="flex cursor-pointer items-center gap-3 rounded-input border border-line px-3 py-2.5 text-sm has-[:checked]:border-ink has-[:checked]:bg-gold-soft"
          >
            <input
              type="radio"
              name="report-reason"
              value={value}
              checked={reason === value}
              onChange={() => setReason(value)}
              className="accent-brand"
            />
            {text}
          </label>
        ))}
      </fieldset>
      <Field label="Details" htmlFor="report-details" optional className="mt-4">
        <Textarea
          id="report-details"
          value={details}
          maxLength={1000}
          onChange={(e) => setDetails(e.target.value)}
          className="min-h-24"
        />
      </Field>
    </Sheet>
  );
}
