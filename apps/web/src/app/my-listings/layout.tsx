import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'My listings', robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
