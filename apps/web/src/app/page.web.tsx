import { HomeScreen } from '@/features/home/home-screen';
import { serverGet } from '@/lib/api/server';
import type { ListingCard, Page } from '@/lib/api/types';

export const revalidate = 60;

export default async function HomePage() {
  const recent = await serverGet<ListingCard[]>('/listings', { sort: 'newest', limit: 12 });
  const initialRecent = recent.status === 200 ? (recent.body as Page<ListingCard>) : undefined;
  return <HomeScreen initialRecent={initialRecent} />;
}
