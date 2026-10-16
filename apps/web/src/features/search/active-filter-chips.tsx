'use client';

import { X } from 'lucide-react';
import { useBrands, useModels } from '@/features/catalogue/hooks';
import { formatPriceShort, label } from '@/lib/format';
import { districtName } from '@/lib/search/districts';
import type { ListingFilters } from '@/lib/search/filters';

interface Chip {
  key: string;
  text: string;
  clear: Partial<ListingFilters>;
}

const range = (min?: number, max?: number, fmt: (n: number) => string = String) =>
  min && max ? `${fmt(min)}–${fmt(max)}` : min ? `${fmt(min)}+` : `Up to ${fmt(max!)}`;

export function ActiveFilterChips({
  filters,
  onChange,
}: {
  filters: ListingFilters;
  onChange: (patch: Partial<ListingFilters>) => void;
}) {
  const { data: brands = [] } = useBrands();
  const brand = brands.find((b) => b.slug === filters.brandSlug);
  const { data: models = [] } = useModels(brand?.id);
  const model = models.find((m) => m.slug === filters.modelSlug);

  const chips: Chip[] = [];
  if (filters.q) chips.push({ key: 'q', text: `“${filters.q}”`, clear: { q: undefined } });
  if (filters.districtSlug)
    chips.push({
      key: 'd',
      text: districtName(filters.districtSlug) ?? filters.districtSlug,
      clear: { districtSlug: undefined },
    });
  if (brand)
    chips.push({
      key: 'b',
      text: brand.name,
      clear: { brandSlug: undefined, modelSlug: undefined },
    });
  if (model) chips.push({ key: 'm', text: model.name, clear: { modelSlug: undefined } });
  if (filters.minPrice || filters.maxPrice)
    chips.push({
      key: 'p',
      text: range(filters.minPrice, filters.maxPrice, formatPriceShort),
      clear: { minPrice: undefined, maxPrice: undefined },
    });
  if (filters.minYear || filters.maxYear)
    chips.push({
      key: 'y',
      text: range(filters.minYear, filters.maxYear),
      clear: { minYear: undefined, maxYear: undefined },
    });
  for (const fuel of filters.fuelType ?? [])
    chips.push({
      key: `f${fuel}`,
      text: label(fuel),
      clear: { fuelType: filters.fuelType!.filter((f) => f !== fuel) },
    });
  for (const t of filters.transmission ?? [])
    chips.push({
      key: `t${t}`,
      text: label(t),
      clear: { transmission: filters.transmission!.filter((x) => x !== t) },
    });
  if (filters.maxKm)
    chips.push({
      key: 'k',
      text: `Under ${filters.maxKm / 1000}k km`,
      clear: { maxKm: undefined },
    });
  if (filters.numberOfOwners)
    chips.push({
      key: 'o',
      text: `Up to ${filters.numberOfOwners} owner${filters.numberOfOwners > 1 ? 's' : ''}`,
      clear: { numberOfOwners: undefined },
    });

  if (!chips.length) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Active filters">
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            onClick={() => onChange(chip.clear)}
            className="flex items-center gap-1 rounded-full border border-brand/30 bg-brand-soft px-3 py-1 text-sm font-medium text-brand hover:bg-brand hover:text-white"
          >
            {chip.text}
            <X className="size-3.5" aria-label="Remove filter" />
          </button>
        </li>
      ))}
    </ul>
  );
}
