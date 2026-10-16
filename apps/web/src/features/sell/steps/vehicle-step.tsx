'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Field, Input } from '@/components/ui/field';
import { pendingVehicleStore, vehicleSchema, VehicleValues } from '../car-form';
import { ChoiceChips } from '../choice-chips';
import { StepFooter } from '../step-footer';
import { CatalogueFields } from './catalogue-fields';
import type { StepProps } from '../step-props';

const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => THIS_YEAR - i);

/** Step 1. Brand and model always come from the catalogue; variant may be typed manually. */
export function VehicleStep({ listing, carForm, setCarForm, next, back }: StepProps) {
  const form = useForm<VehicleValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      brandId: '',
      modelId: '',
      variantId: '',
      variantText: '',
      manualVariant: false,
      fuelType: '',
      transmission: '',
      ...carForm,
    },
  });
  const { control, register, formState } = form;
  const errors = formState.errors;

  const submit = form.handleSubmit((values) => {
    setCarForm(values);
    pendingVehicleStore.save(listing.id, values);
    next();
  });

  return (
    <form onSubmit={submit} className="space-y-5" noValidate>
      <CatalogueFields form={form} />

      <Field label="Manufacturing year" htmlFor="year" error={errors.manufacturingYear?.message}>
        <select
          id="year"
          className="h-11 w-full rounded-input border border-line-strong bg-surface px-3"
          {...register('manufacturingYear', { setValueAs: (v) => (v ? Number(v) : undefined) })}
        >
          <option value="">Select year</option>
          {YEARS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </Field>

      {(
        [
          [
            'fuelType',
            'Fuel type',
            [
              ['PETROL', 'Petrol'],
              ['DIESEL', 'Diesel'],
              ['CNG', 'CNG'],
              ['ELECTRIC', 'Electric'],
            ],
          ],
          [
            'transmission',
            'Transmission',
            [
              ['MANUAL', 'Manual'],
              ['AUTOMATIC', 'Automatic'],
            ],
          ],
        ] as const
      ).map(([name, text, options]) => (
        <Field key={name} label={text} htmlFor={name} error={errors[name]?.message}>
          <Controller
            control={control}
            name={name}
            render={({ field }) => (
              <ChoiceChips
                name={text}
                value={field.value}
                onChange={field.onChange}
                options={options.map(([value, label]) => ({ value, label }))}
              />
            )}
          />
        </Field>
      ))}

      <Field label="KM driven" htmlFor="km" error={errors.kmDriven?.message}>
        <Input
          id="km"
          inputMode="numeric"
          placeholder="e.g. 45000"
          {...register('kmDriven', {
            setValueAs: (v) => (v === '' ? undefined : Number(String(v).replace(/\D/g, ''))),
          })}
        />
      </Field>

      <Field label="Number of owners" htmlFor="owners" error={errors.numberOfOwners?.message}>
        <Controller
          control={control}
          name="numberOfOwners"
          render={({ field }) => (
            <ChoiceChips
              name="Number of owners"
              value={field.value}
              onChange={field.onChange}
              options={[1, 2, 3, 4].map((n) => ({
                value: n,
                label: n === 4 ? '4+' : `${n}${n === 1 ? 'st' : n === 2 ? 'nd' : 'rd'}`,
              }))}
            />
          )}
        />
      </Field>

      <StepFooter onBack={listing.status === 'DRAFT' ? undefined : back} />
    </form>
  );
}
