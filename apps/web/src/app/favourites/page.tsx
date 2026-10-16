'use client';

import { AuthGate } from '@/features/auth/auth-gate';
import { FavouritesScreen } from '@/features/favourites/favourites-screen';

export default function FavouritesPage() {
  return <AuthGate title="Log in to see your saved cars">{() => <FavouritesScreen />}</AuthGate>;
}
