import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Saved cars', robots: { index: false, follow: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
