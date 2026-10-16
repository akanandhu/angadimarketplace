/** Kerala districts (V1 market), ordered for discovery prominence. Slugs match the API. */
export const KERALA_DISTRICTS = [
  { name: 'Ernakulam', slug: 'ernakulam' },
  { name: 'Thiruvananthapuram', slug: 'thiruvananthapuram' },
  { name: 'Kozhikode', slug: 'kozhikode' },
  { name: 'Thrissur', slug: 'thrissur' },
  { name: 'Kottayam', slug: 'kottayam' },
  { name: 'Malappuram', slug: 'malappuram' },
  { name: 'Kollam', slug: 'kollam' },
  { name: 'Kannur', slug: 'kannur' },
  { name: 'Palakkad', slug: 'palakkad' },
  { name: 'Alappuzha', slug: 'alappuzha' },
  { name: 'Pathanamthitta', slug: 'pathanamthitta' },
  { name: 'Idukki', slug: 'idukki' },
  { name: 'Wayanad', slug: 'wayanad' },
  { name: 'Kasaragod', slug: 'kasaragod' },
] as const;

const BY_SLUG = new Map<string, string>(KERALA_DISTRICTS.map((d) => [d.slug, d.name]));

export const districtName = (slug?: string) => (slug ? BY_SLUG.get(slug) : undefined);
export const isDistrictSlug = (slug: string) => BY_SLUG.has(slug);
