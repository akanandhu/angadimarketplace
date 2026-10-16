'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { ListingDetailScreen } from '@/features/listing-detail/listing-detail-screen';
import { UnavailableListingState } from '@/features/listing-detail/unavailable-listing';

function ListingContent() {
  const slug = useSearchParams().get('slug');
  return slug ? <ListingDetailScreen slug={slug} /> : <UnavailableListingState />;
}

/** Client-rendered listing page for the mobile app (/listing?slug=...). */
export default function ListingPage() {
  return (
    <Suspense>
      <ListingContent />
    </Suspense>
  );
}
