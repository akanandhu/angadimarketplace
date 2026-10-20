import type { Metadata, Viewport } from 'next';
import { Anek_Malayalam, Bricolage_Grotesque, Geist } from 'next/font/google';
import { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { PublicOnly } from '@/components/layout/public-only';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { AppProviders } from '@/components/providers/app-providers';
import { SITE_URL } from '@/lib/env';
import './globals.css';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  weight: ['600', '700'],
  display: 'swap',
});
// Footer wordmark only, so it is not preloaded on first paint.
const anekMalayalam = Anek_Malayalam({
  subsets: ['malayalam'],
  variable: '--font-anek-malayalam',
  axes: ['wdth'],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Angadi — Used cars in Kerala', template: '%s | Angadi' },
  description:
    'Buy and sell second-hand cars across Kerala. Free listings, district-wise search and private, seller-approved contact.',
  applicationName: 'Angadi',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0e3337',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-IN"
      className={`${geist.variable} ${bricolage.variable} ${anekMalayalam.variable}`}
    >
      <body className="min-h-dvh pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
        <AppProviders>
          <SiteHeader />
          <main>{children}</main>
          <PublicOnly>
            <SiteFooter />
          </PublicOnly>
          <BottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
