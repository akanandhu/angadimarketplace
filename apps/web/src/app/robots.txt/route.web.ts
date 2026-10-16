import { SITE_URL } from '@/lib/env';

const PRIVATE = [
  '/admin',
  '/sell',
  '/my-listings',
  '/requests',
  '/favourites',
  '/notifications',
  '/profile',
  '/login',
];
// Query-string screens used by the mobile build duplicate the SEO pages.
const DUPLICATES = ['/search', '/listing', '/dealer?'];

export function GET() {
  const lines = [
    'User-agent: *',
    'Allow: /',
    ...[...PRIVATE, ...DUPLICATES].map((path) => `Disallow: ${path}`),
    `Sitemap: ${SITE_URL}/sitemap.xml`,
  ];
  return new Response(lines.join('\n'), { headers: { 'content-type': 'text/plain' } });
}
