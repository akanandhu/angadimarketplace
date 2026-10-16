'use client';

import { Suspense } from 'react';
import { AuthGate } from '@/features/auth/auth-gate';
import { RequestsScreen } from '@/features/requests/requests-screen';

export default function RequestsPage() {
  return (
    <AuthGate title="Log in to see your contact requests">
      {() => (
        <Suspense>
          <RequestsScreen />
        </Suspense>
      )}
    </AuthGate>
  );
}
