'use client';

import { FormEvent, useState } from 'react';
import { Field, Textarea } from '@/components/ui/field';
import { StepFooter } from '../step-footer';
import type { StepProps } from '../step-props';
import { useSaveListing } from '../use-save-listing';

const LIMIT = 4000;

/** Step 6. Optional free text. */
export function DescriptionStep(props: StepProps) {
  const [description, setDescription] = useState(props.listing.description ?? '');
  const { save, saving, error } = useSaveListing(props);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void save({ description: description.trim() });
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <Field
        label="Tell buyers anything useful about the car"
        htmlFor="description"
        optional
        error={error}
        hint={`${description.length}/${LIMIT} · Service history, recent work, tyres, why you're selling...`}
      >
        <Textarea
          id="description"
          value={description}
          maxLength={LIMIT}
          onChange={(event) => setDescription(event.target.value)}
          className="min-h-48"
        />
      </Field>
      <StepFooter onBack={props.back} loading={saving} />
    </form>
  );
}
