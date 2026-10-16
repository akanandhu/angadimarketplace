'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { DealerScreen } from '@/features/dealer/dealer-screen';

function DealerContent() {
  const slug = useSearchParams().get('slug');
  return slug ? <DealerScreen slug={slug} /> : null;
}

/** Client-rendered dealer page for the mobile app (/dealer?slug=...). */
export default function DealerPage() {
  return (
    <Suspense>
      <DealerContent />
    </Suspense>
  );
}
