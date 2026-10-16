'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { BrowseScreen } from '@/features/search/browse-screen';
import { parseFilters } from '@/lib/search/filters';

function SearchContent() {
  const params = useSearchParams();
  return <BrowseScreen filters={parseFilters(params)} />;
}

/** Client-rendered search used by the mobile app (no server runtime). */
export default function SearchPage() {
  return (
    <Suspense>
      <SearchContent />
    </Suspense>
  );
}
