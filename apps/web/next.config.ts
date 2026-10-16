import type { NextConfig } from 'next';

/**
 * One codebase, two targets:
 * - web: Next.js server; SEO pages (`*.web.tsx`) are server-rendered.
 * - mobile: static export bundled into Capacitor; client pages (`*.mobile.tsx`) fetch data.
 * Files without a target suffix are shared.
 */
const isMobile = process.env.BUILD_TARGET === 'mobile';
const target = isMobile ? 'mobile' : 'web';

const nextConfig: NextConfig = {
  pageExtensions: ['tsx', 'ts', `${target}.tsx`, `${target}.ts`],
  env: { NEXT_PUBLIC_BUILD_TARGET: target },
  // Listing photos are already optimised WebP variants served from the CDN.
  images: { unoptimized: true },
  ...(isMobile ? { output: 'export', trailingSlash: true } : {}),
};

export default nextConfig;
