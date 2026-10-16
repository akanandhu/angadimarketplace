'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { AuthGate } from '@/features/auth/auth-gate';
import { SellIntro } from '@/features/sell/sell-intro';
import { SellScreen } from '@/features/sell/sell-screen';

function SellContent() {
  const id = useSearchParams().get('id');
  return id ? <SellScreen key={id} id={id} /> : <SellIntro />;
}

export default function SellPage() {
  return (
    <AuthGate title="Log in to sell your car">
      {() => (
        <Suspense>
          <SellContent />
        </Suspense>
      )}
    </AuthGate>
  );
}
