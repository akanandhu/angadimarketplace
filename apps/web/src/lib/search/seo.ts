import { districtName, isDistrictSlug } from './districts';
import type { ListingFilters } from './filters';

/**
 * /cars/[district]/[brand]/[model] — every segment optional, district first.
 * Returns null when the path has more segments than this shape allows.
 */
export function parseBrowseSegments(segments: string[] = []): ListingFilters | null {
  const rest = [...segments];
  const filters: ListingFilters = {};
  if (rest[0] && isDistrictSlug(rest[0])) filters.districtSlug = rest.shift();
  if (rest[0]) filters.brandSlug = rest.shift();
  if (rest[0]) filters.modelSlug = rest.shift();
  return rest.length ? null : filters;
}

interface Names {
  brand?: string;
  model?: string;
}

/** "Used Hyundai Creta cars in Ernakulam" */
export function browseHeading(filters: ListingFilters, names: Names = {}): string {
  const vehicle = [names.brand, names.model].filter(Boolean).join(' ');
  const place = districtName(filters.districtSlug) ?? 'Kerala';
  return `Used ${vehicle ? `${vehicle} ` : ''}cars in ${place}`;
}

export function browseDescription(filters: ListingFilters, names: Names = {}, total?: number) {
  const heading = browseHeading(filters, names);
  const count = total ? `${total} ` : '';
  return `Browse ${count}${heading.charAt(0).toLowerCase()}${heading.slice(1)} on Angadi. Compare prices, km and ownership, and contact sellers privately.`;
}
