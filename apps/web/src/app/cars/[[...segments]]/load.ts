import 'server-only';
import { cache } from 'react';
import { serverGet } from '@/lib/api/server';
import type { ListingCard, Page } from '@/lib/api/types';
import { parseFilters } from '@/lib/search/filters';
import { browseDescription, browseHeading, parseBrowseSegments } from '@/lib/search/seo';

type SearchParams = Record<string, string | string[] | undefined>;

/** Resolves /cars/... into filters, catalogue names and the first page of results. */
export const loadBrowse = cache(
  async (segments: string[] | undefined, searchParams: SearchParams) => {
    const pathFilters = parseBrowseSegments(segments);
    if (!pathFilters) return null;

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (typeof value === 'string') params.set(key, value);
    }
    const filters = { ...parseFilters(params), ...pathFilters };

    let names: { brand?: string; model?: string } = {};
    if (filters.brandSlug) {
      const resolved = await serverGet<{
        brand: { name: string } | null;
        model: { name: string } | null;
      }>(
        '/vehicle-catalogue/resolve',
        { brand: filters.brandSlug, model: filters.modelSlug },
        3600,
      );
      const data = resolved.body?.data;
      if (!data?.brand || (filters.modelSlug && !data.model)) return null;
      names = { brand: data.brand.name, model: data.model?.name };
    }

    const results = await serverGet<ListingCard[]>('/listings', { ...filters });
    const initialData = results.status === 200 ? (results.body as Page<ListingCard>) : undefined;
    return {
      filters,
      initialData,
      heading: browseHeading(filters, names),
      description: browseDescription(filters, names, initialData?.meta.total),
    };
  },
);
