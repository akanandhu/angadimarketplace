export interface ListingTextInput {
  listingId: string;
  year: number;
  brand: string;
  model: string;
  variant: string;
  fuelType: string;
  transmission: string;
  district: string;
}

const slugPart = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** "2021 Hyundai Creta SX" */
export function buildTitle(input: ListingTextInput): string {
  return [input.year, input.brand, input.model, input.variant].join(' ').replace(/\s+/g, ' ');
}

/** "2021-hyundai-creta-sx-ernakulam-3f9a1c2e" — the id suffix keeps it unique. */
export function buildSlug(input: ListingTextInput): string {
  const base = slugPart(`${buildTitle(input)} ${input.district}`).slice(0, 80);
  return `${base}-${input.listingId.replace(/-/g, '').slice(0, 8)}`;
}

/** Lower-cased text matched by pg_trgm search. */
export function buildSearchText(input: ListingTextInput): string {
  return [
    input.year,
    input.brand,
    input.model,
    input.variant,
    input.fuelType,
    input.transmission,
    input.district,
  ]
    .join(' ')
    .toLowerCase();
}
