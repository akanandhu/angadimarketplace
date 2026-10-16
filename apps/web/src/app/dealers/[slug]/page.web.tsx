import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { DealerScreen } from '@/features/dealer/dealer-screen';
import { serverGet } from '@/lib/api/server';
import type { DealerPublic, ListingCard, Page } from '@/lib/api/types';
import { routes } from '@/lib/routes';

interface Props {
  params: Promise<{ slug: string }>;
}

const loadDealer = cache((slug: string) =>
  serverGet<DealerPublic>(`/dealers/${encodeURIComponent(slug)}`),
);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const dealer = (await loadDealer(slug)).body?.data;
  if (!dealer) return { title: 'Dealer not found' };
  const where = dealer.district?.name ?? 'Kerala';
  return {
    title: `${dealer.businessName} — used cars in ${where}`,
    description: `Browse ${dealer.activeListingCount} used cars from ${dealer.businessName}, ${where}, on Angadi.`,
    alternates: { canonical: routes.dealer(slug) },
  };
}

export default async function DealerPage({ params }: Props) {
  const { slug } = await params;
  const [dealer, listings] = await Promise.all([
    loadDealer(slug),
    serverGet<ListingCard[]>(`/dealers/${encodeURIComponent(slug)}/listings`, {
      page: 1,
      limit: 20,
    }),
  ]);
  if (dealer.status !== 200 || !dealer.body?.data) notFound();
  return (
    <DealerScreen
      slug={slug}
      initialDealer={dealer.body.data}
      initialListings={listings.status === 200 ? (listings.body as Page<ListingCard>) : undefined}
    />
  );
}
