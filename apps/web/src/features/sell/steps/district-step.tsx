'use client';

import { FormEvent, useState } from 'react';
import { Field } from '@/components/ui/field';
import { useDistricts } from '@/features/catalogue/hooks';
import { SearchableSelect } from '../searchable-select';
import { StepFooter } from '../step-footer';
import type { StepProps } from '../step-props';
import { useSaveListing } from '../use-save-listing';

/** Step 4. Kerala districts only in V1. */
export function DistrictStep(props: StepProps) {
  const { data: districts = [] } = useDistricts();
  const [districtId, setDistrictId] = useState(props.listing.district?.id ?? '');
  const [fieldError, setFieldError] = useState<string>();
  const { save, saving, error } = useSaveListing(props);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!districtId) return setFieldError('Select the district where the car is');
    void save({ districtId });
  };

  return (
    <form onSubmit={submit} className="space-y-6" noValidate>
      <Field
        label="District"
        htmlFor="district"
        error={fieldError ?? error}
        hint="Where can buyers see the car? Kerala only for now."
      >
        <SearchableSelect
          id="district"
          label="District"
          value={districtId}
          invalid={Boolean(fieldError)}
          options={districts.map((d) => ({ value: d.id, label: d.name }))}
          onChange={(value) => {
            setFieldError(undefined);
            setDistrictId(value);
          }}
        />
      </Field>
      <StepFooter onBack={props.back} loading={saving} />
    </form>
  );
}
