export const isMobileBuild = process.env.NEXT_PUBLIC_BUILD_TARGET === 'mobile';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

/** SSR fetches may use an internal address; the browser always uses API_URL. */
export const SERVER_API_URL = process.env.API_INTERNAL_URL ?? API_URL;

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://angadimarketplace.com';
