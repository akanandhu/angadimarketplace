'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import { AuthGate } from '@/features/auth/auth-gate';

function Redirect() {
  const router = useRouter();
  const next = useSearchParams().get('next');
  useEffect(() => {
    // Only allow in-app destinations.
    router.replace(next?.startsWith('/') && !next.startsWith('//') ? next : '/');
  }, [router, next]);
  return null;
}

/** Direct login entry point; after login it forwards to ?next=. */
export default function LoginPage() {
  return (
    <AuthGate>
      {() => (
        <Suspense>
          <Redirect />
        </Suspense>
      )}
    </AuthGate>
  );
}
