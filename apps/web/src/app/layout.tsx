import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { ReactNode } from 'react';
import { BottomNav } from '@/components/layout/bottom-nav';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { AppProviders } from '@/components/providers/app-providers';
import { SITE_URL } from '@/lib/env';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

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
  themeColor: '#1f7a4d',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <body className="min-h-dvh">
        <AppProviders>
          <SiteHeader />
          <main className="pb-24 md:pb-0">{children}</main>
          <SiteFooter />
          <BottomNav />
        </AppProviders>
      </body>
    </html>
  );
}
