'use client';

import { FormEvent, useState } from 'react';
import { Field } from '@/components/ui/field';
import { Toggle } from '@/components/ui/toggle';
import { formatNumber } from '@/lib/format';
import { StepFooter } from '../step-footer';
import type { StepProps } from '../step-props';
import { useSaveListing } from '../use-save-listing';

/** Step 3. Expected price (required, > 0, INR-formatted while typing) and negotiable flag. */
export function PriceStep(props: StepProps) {
  const { listing, back } = props;
  const [price, setPrice] = useState(listing.price ?? 0);
  const [negotiable, setNegotiable] = useState(listing.isNegotiable);
  const [fieldError, setFieldError] = useState<string>();
  const { save, saving, error } = useSaveListing(props);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!price || price <= 0) return setFieldError('Enter an expected price above ₹0');
    if (price > 1_000_000_000) return setFieldError('That price looks too high');
    void save({ price, isNegotiable: negotiable });
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <Field label="Expected price" htmlFor="price" error={fieldError ?? error}>
        <div className="flex">
          <span className="flex items-center rounded-l-input border border-r-0 border-line-strong bg-canvas px-3 font-semibold">
            ₹
          </span>
          <input
            id="price"
            inputMode="numeric"
            placeholder="6,50,000"
            value={price ? formatNumber(price) : ''}
            onChange={(event) => {
              setFieldError(undefined);
              setPrice(Number(event.target.value.replace(/\D/g, '').slice(0, 10)) || 0);
            }}
            className="h-12 w-full rounded-r-input border border-line-strong bg-surface px-3 text-lg font-semibold focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
          />
        </div>
      </Field>
      <Toggle
        id="negotiable"
        checked={negotiable}
        onChange={setNegotiable}
        label="Price is negotiable"
        description="Buyers will see a Negotiable tag."
      />
      <StepFooter onBack={back} loading={saving} />
    </form>
  );
}
