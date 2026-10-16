'use client';

import { DistrictSelect } from '@/features/catalogue/district-select';
import { useBrands, useModels } from '@/features/catalogue/hooks';
import { formatPriceShort } from '@/lib/format';
import type { ListingFilters } from '@/lib/search/filters';
import { ChipGroup, FilterSection, OptionSelect } from './filter-controls';

const PRICES = [100000, 200000, 300000, 500000, 800000, 1000000, 1500000, 2000000, 3000000];
const KMS = [10000, 25000, 50000, 75000, 100000, 150000];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 20 }, (_, i) => THIS_YEAR - i);

const priceOptions = PRICES.map((p) => ({ value: String(p), label: formatPriceShort(p) }));
const yearOptions = YEARS.map((y) => ({ value: String(y), label: String(y) }));
const kmOptions = KMS.map((k) => ({ value: String(k), label: `Under ${k / 1000}k km` }));
const num = (value: string) => (value ? Number(value) : undefined);

interface Props {
  filters: ListingFilters;
  onChange: (patch: Partial<ListingFilters>) => void;
  idPrefix: string;
}

export function FilterPanel({ filters, onChange, idPrefix }: Props) {
  const { data: brands = [] } = useBrands();
  const brandId = brands.find((brand) => brand.slug === filters.brandSlug)?.id;
  const { data: models = [] } = useModels(brandId);
  const id = (name: string) => `${idPrefix}-${name}`;

  return (
    <div>
      <FilterSection title="District">
        <DistrictSelect
          id={id('district')}
          by="slug"
          placeholder="All Kerala"
          value={filters.districtSlug ?? ''}
          onChange={(value) => onChange({ districtSlug: value || undefined })}
          className="h-10 text-sm"
        />
      </FilterSection>

      <FilterSection title="Brand & model">
        <OptionSelect
          id={id('brand')}
          label="Brand"
          anyLabel="All brands"
          value={filters.brandSlug ?? ''}
          options={brands.map((b) => ({ value: b.slug, label: b.name }))}
          onChange={(value) => onChange({ brandSlug: value || undefined, modelSlug: undefined })}
        />
        <OptionSelect
          id={id('model')}
          label="Model"
          anyLabel={filters.brandSlug ? 'All models' : 'Select a brand first'}
          disabled={!filters.brandSlug}
          value={filters.modelSlug ?? ''}
          options={models.map((m) => ({ value: m.slug, label: m.name }))}
          onChange={(value) => onChange({ modelSlug: value || undefined })}
        />
      </FilterSection>

      <FilterSection title="Price">
        <div className="flex gap-2">
          <OptionSelect
            id={id('min-price')}
            label="Minimum price"
            anyLabel="Min"
            value={String(filters.minPrice ?? '')}
            options={priceOptions}
            onChange={(v) => onChange({ minPrice: num(v) })}
          />
          <OptionSelect
            id={id('max-price')}
            label="Maximum price"
            anyLabel="Max"
            value={String(filters.maxPrice ?? '')}
            options={priceOptions}
            onChange={(v) => onChange({ maxPrice: num(v) })}
          />
        </div>
      </FilterSection>

      <FilterSection title="Manufacturing year">
        <div className="flex gap-2">
          <OptionSelect
            id={id('min-year')}
            label="From year"
            anyLabel="From"
            value={String(filters.minYear ?? '')}
            options={yearOptions}
            onChange={(v) => onChange({ minYear: num(v) })}
          />
          <OptionSelect
            id={id('max-year')}
            label="To year"
            anyLabel="To"
            value={String(filters.maxYear ?? '')}
            options={yearOptions}
            onChange={(v) => onChange({ maxYear: num(v) })}
          />
        </div>
      </FilterSection>

      <FilterSection title="Fuel">
        <ChipGroup
          selected={filters.fuelType ?? []}
          onChange={(fuelType) => onChange({ fuelType })}
          options={[
            { value: 'PETROL', label: 'Petrol' },
            { value: 'DIESEL', label: 'Diesel' },
            { value: 'CNG', label: 'CNG' },
            { value: 'ELECTRIC', label: 'Electric' },
          ]}
        />
      </FilterSection>

      <FilterSection title="Transmission">
        <ChipGroup
          selected={filters.transmission ?? []}
          onChange={(transmission) => onChange({ transmission })}
          options={[
            { value: 'MANUAL', label: 'Manual' },
            { value: 'AUTOMATIC', label: 'Automatic' },
          ]}
        />
      </FilterSection>

      <FilterSection title="KM driven">
        <OptionSelect
          id={id('km')}
          label="Maximum KM driven"
          anyLabel="Any KM"
          value={String(filters.maxKm ?? '')}
          options={kmOptions}
          onChange={(v) => onChange({ maxKm: num(v) })}
        />
      </FilterSection>

      <FilterSection title="Owners">
        <OptionSelect
          id={id('owners')}
          label="Number of owners"
          anyLabel="Any"
          value={String(filters.numberOfOwners ?? '')}
          options={[
            { value: '1', label: '1st owner only' },
            { value: '2', label: 'Up to 2 owners' },
            { value: '3', label: 'Up to 3 owners' },
          ]}
          onChange={(v) => onChange({ numberOfOwners: num(v) })}
        />
      </FilterSection>
    </div>
  );
}
