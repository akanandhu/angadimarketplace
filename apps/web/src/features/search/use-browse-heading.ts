'use client';

import { useBrands, useModels } from '@/features/catalogue/hooks';
import type { ListingFilters } from '@/lib/search/filters';
import { browseHeading } from '@/lib/search/seo';

/** Client-side heading for screens without a server-rendered one (mobile /search). */
export function useBrowseHeading(filters: ListingFilters, serverHeading?: string) {
  const { data: brands = [] } = useBrands();
  const brand = brands.find((b) => b.slug === filters.brandSlug);
  const { data: models = [] } = useModels(brand?.id);
  const model = models.find((m) => m.slug === filters.modelSlug);
  if (serverHeading) return serverHeading;
  return browseHeading(filters, { brand: brand?.name, model: model?.name });
}
