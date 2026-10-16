import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sell your car',
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
