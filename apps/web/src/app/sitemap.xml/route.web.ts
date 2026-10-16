import { serverGet } from '@/lib/api/server';
import { SITE_URL } from '@/lib/env';
import { KERALA_DISTRICTS } from '@/lib/search/districts';

export const revalidate = 3600;

const POPULAR_BRANDS = ['maruti-suzuki', 'hyundai', 'tata', 'toyota', 'honda', 'mahindra', 'kia', 'renault'];
const MAX_PAGES = 10;

interface Entry {
  loc: string;
  lastmod?: string;
}

/** Landing pages plus every active listing, discovered via the API. */
export async function GET() {
  const entries: Entry[] = [
    { loc: SITE_URL },
    { loc: `${SITE_URL}/cars` },
    ...KERALA_DISTRICTS.map((d) => ({ loc: `${SITE_URL}/cars/${d.slug}` })),
    ...POPULAR_BRANDS.map((b) => ({ loc: `${SITE_URL}/cars/${b}` })),
  ];

  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await serverGet<{ slug: string; updatedAt: string }[]>('/listings/sitemap', { page, limit: 5000 }, 3600);
    for (const row of res.body?.data ?? []) {
      entries.push({ loc: `${SITE_URL}/car/${row.slug}`, lastmod: row.updatedAt });
    }
    const meta = res.body?.meta as { totalPages?: number } | undefined;
    if (!meta?.totalPages || page >= meta.totalPages) break;
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map(
      (e) => `  <url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`,
    ),
    '</urlset>',
  ].join('\n');
  return new Response(xml, { headers: { 'content-type': 'application/xml' } });
}
