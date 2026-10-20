/**
 * Kerala districts (V1 market), ordered for discovery prominence. Slugs match the API.
 * `rto` is the district's original KL registration series, used as a visual plate.
 */
export const KERALA_DISTRICTS = [
  { name: 'Ernakulam', slug: 'ernakulam', rto: 'KL 07' },
  { name: 'Thiruvananthapuram', slug: 'thiruvananthapuram', rto: 'KL 01' },
  { name: 'Kozhikode', slug: 'kozhikode', rto: 'KL 11' },
  { name: 'Thrissur', slug: 'thrissur', rto: 'KL 08' },
  { name: 'Kottayam', slug: 'kottayam', rto: 'KL 05' },
  { name: 'Malappuram', slug: 'malappuram', rto: 'KL 10' },
  { name: 'Kollam', slug: 'kollam', rto: 'KL 02' },
  { name: 'Kannur', slug: 'kannur', rto: 'KL 13' },
  { name: 'Palakkad', slug: 'palakkad', rto: 'KL 09' },
  { name: 'Alappuzha', slug: 'alappuzha', rto: 'KL 04' },
  { name: 'Pathanamthitta', slug: 'pathanamthitta', rto: 'KL 03' },
  { name: 'Idukki', slug: 'idukki', rto: 'KL 06' },
  { name: 'Wayanad', slug: 'wayanad', rto: 'KL 12' },
  { name: 'Kasaragod', slug: 'kasaragod', rto: 'KL 14' },
] as const;

const BY_SLUG = new Map<string, string>(KERALA_DISTRICTS.map((d) => [d.slug, d.name]));

export const districtName = (slug?: string) => (slug ? BY_SLUG.get(slug) : undefined);
export const isDistrictSlug = (slug: string) => BY_SLUG.has(slug);
