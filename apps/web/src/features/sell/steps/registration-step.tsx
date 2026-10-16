'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Field, Input, Textarea } from '@/components/ui/field';
import { sellerApi } from '@/lib/api/endpoints/seller';
import { errorMessage, isApiError } from '@/lib/api/errors';
import { publicRtoPreview } from '@/lib/registration';
import {
  pendingVehicleStore,
  registrationSchema,
  RegistrationValues,
  VehicleValues,
} from '../car-form';
import { ChoiceChips } from '../choice-chips';
import { StepFooter } from '../step-footer';
import type { StepProps } from '../step-props';

/** Step 2. Saves the complete car details (steps 1 + 2) to the draft. */
export function RegistrationStep({ listing, carForm, setCarForm, onSaved, next, back }: StepProps) {
  const [error, setError] = useState<string>();
  const form = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      registrationNumber: '',
      accidentHistory: '',
      hasMajorReplacement: '',
      replacementDetails: '',
      ...carForm,
    },
  });
  const { control, register, watch, formState, setError: setFieldError } = form;
  const errors = formState.errors;
  const preview = publicRtoPreview(watch('registrationNumber') ?? '');
  const replaced = watch('hasMajorReplacement') === 'yes';

  const submit = form.handleSubmit(async (values) => {
    const vehicle = carForm as VehicleValues;
    setError(undefined);
    try {
      const saved = await sellerApi.putCarDetails(listing.id, {
        brandId: vehicle.brandId,
        modelId: vehicle.modelId,
        variantId: vehicle.manualVariant ? null : vehicle.variantId,
        variantText: vehicle.manualVariant ? vehicle.variantText : null,
        manufacturingYear: vehicle.manufacturingYear,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        kmDriven: vehicle.kmDriven,
        numberOfOwners: vehicle.numberOfOwners,
        registrationNumber: values.registrationNumber,
        accidentHistory: values.accidentHistory || null,
        hasMajorReplacement: values.hasMajorReplacement
          ? values.hasMajorReplacement === 'yes'
          : null,
        replacementDetails: replaced ? values.replacementDetails : null,
      });
      setCarForm(values);
      pendingVehicleStore.clear(listing.id);
      onSaved(saved);
      next();
    } catch (err) {
      if (isApiError(err, 'INVALID_REGISTRATION_NUMBER')) {
        setFieldError('registrationNumber', { message: err.message });
      } else setError(errorMessage(err));
    }
  });

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <Field
        label="Registration number"
        htmlFor="registration"
        error={errors.registrationNumber?.message}
        hint={preview ? `Buyers will see: ${preview}` : undefined}
      >
        <Input
          id="registration"
          autoCapitalize="characters"
          placeholder="KL 07 AB 1234"
          {...register('registrationNumber')}
        />
      </Field>
      <p className="flex gap-2 rounded-button bg-brand-soft p-3 text-sm text-brand-strong">
        <ShieldCheck className="size-4 shrink-0 translate-y-0.5" aria-hidden />
        Your full registration number will not be shown publicly. Buyers only see the RTO code.
      </p>

      <Field label="Accident history" htmlFor="accident" optional>
        <Controller
          control={control}
          name="accidentHistory"
          render={({ field }) => (
            <ChoiceChips
              name="Accident history"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'NO', label: 'No accidents' },
                { value: 'MINOR', label: 'Minor' },
                { value: 'MAJOR', label: 'Major' },
              ]}
            />
          )}
        />
      </Field>

      <Field label="Any major part replaced?" htmlFor="replacement" optional>
        <Controller
          control={control}
          name="hasMajorReplacement"
          render={({ field }) => (
            <ChoiceChips
              name="Major replacement"
              value={field.value}
              onChange={field.onChange}
              options={[
                { value: 'no', label: 'No' },
                { value: 'yes', label: 'Yes' },
              ]}
            />
          )}
        />
      </Field>

      {replaced && (
        <Field
          label="What was replaced?"
          htmlFor="replacementDetails"
          error={errors.replacementDetails?.message}
        >
          <Textarea
            id="replacementDetails"
            className="min-h-20"
            placeholder="e.g. Engine overhauled in 2023"
            {...register('replacementDetails')}
          />
        </Field>
      )}

      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <StepFooter onBack={back} loading={formState.isSubmitting} />
    </form>
  );
}
