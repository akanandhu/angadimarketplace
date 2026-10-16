'use client';

import { Suspense } from 'react';
import { AuthGate } from '@/features/auth/auth-gate';
import { MyListingsScreen } from '@/features/my-listings/my-listings-screen';

export default function MyListingsPage() {
  return (
    <AuthGate title="Log in to manage your listings">
      {() => (
        <Suspense>
          <MyListingsScreen />
        </Suspense>
      )}
    </AuthGate>
  );
}
