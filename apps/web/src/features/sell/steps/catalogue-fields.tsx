'use client';

import { Controller, UseFormReturn } from 'react-hook-form';
import { Field, Input } from '@/components/ui/field';
import { useBrands, useModels, useVariants } from '@/features/catalogue/hooks';
import type { VehicleValues } from '../car-form';
import { SearchableSelect } from '../searchable-select';

/** Brand -> Model -> Variant, with a manual variant fallback when the catalogue lacks it. */
export function CatalogueFields({ form }: { form: UseFormReturn<VehicleValues> }) {
  const { control, register, watch, setValue, formState } = form;
  const errors = formState.errors;
  const [brandId, modelId, manualVariant] = watch(['brandId', 'modelId', 'manualVariant']);
  const brands = useBrands();
  const models = useModels(brandId || undefined);
  const variants = useVariants(modelId || undefined);

  return (
    <>
      <Field label="Brand" htmlFor="brand" error={errors.brandId?.message}>
        <Controller
          control={control}
          name="brandId"
          render={({ field }) => (
            <SearchableSelect
              id="brand"
              label="Brand"
              value={field.value}
              invalid={Boolean(errors.brandId)}
              options={(brands.data ?? []).map((b) => ({ value: b.id, label: b.name }))}
              onChange={(value) => {
                field.onChange(value);
                setValue('modelId', '');
                setValue('variantId', '');
              }}
            />
          )}
        />
      </Field>

      <Field label="Model" htmlFor="model" error={errors.modelId?.message}>
        <Controller
          control={control}
          name="modelId"
          render={({ field }) => (
            <SearchableSelect
              id="model"
              label="Model"
              value={field.value}
              disabled={!brandId}
              invalid={Boolean(errors.modelId)}
              placeholder={brandId ? 'Select model' : 'Select a brand first'}
              options={(models.data ?? []).map((m) => ({ value: m.id, label: m.name }))}
              onChange={(value) => {
                field.onChange(value);
                setValue('variantId', '');
              }}
            />
          )}
        />
      </Field>

      {manualVariant ? (
        <Field
          label="Variant"
          htmlFor="variantText"
          error={errors.variantId?.message}
          hint={
            <button
              type="button"
              className="font-semibold text-brand"
              onClick={() => setValue('manualVariant', false)}
            >
              Choose from the list instead
            </button>
          }
        >
          <Input id="variantText" placeholder="e.g. SX Tech Pack" {...register('variantText')} />
        </Field>
      ) : (
        <Field label="Variant" htmlFor="variant" error={errors.variantId?.message}>
          <Controller
            control={control}
            name="variantId"
            render={({ field }) => (
              <SearchableSelect
                id="variant"
                label="Variant"
                value={field.value}
                disabled={!modelId}
                invalid={Boolean(errors.variantId)}
                placeholder={modelId ? 'Select variant' : 'Select a model first'}
                options={(variants.data ?? []).map((v) => ({ value: v.id, label: v.name }))}
                onChange={field.onChange}
                footer={
                  <button
                    type="button"
                    className="text-sm font-semibold text-brand"
                    onClick={() => setValue('manualVariant', true)}
                  >
                    Can&apos;t find your variant? Enter it manually
                  </button>
                }
              />
            )}
          />
          {modelId && (
            <button
              type="button"
              className="mt-1.5 text-sm font-semibold text-brand"
              onClick={() => setValue('manualVariant', true)}
            >
              Can&apos;t find your variant? Enter variant manually
            </button>
          )}
        </Field>
      )}
    </>
  );
}
