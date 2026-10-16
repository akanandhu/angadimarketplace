import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { ListingDetailScreen } from '@/features/listing-detail/listing-detail-screen';
import { UnavailableListingState } from '@/features/listing-detail/unavailable-listing';
import { serverGet } from '@/lib/api/server';
import type { ListingDetail, UnavailableListing } from '@/lib/api/types';
import { formatKm, formatPrice, label } from '@/lib/format';
import { routes } from '@/lib/routes';

interface Props {
  params: Promise<{ slug: string }>;
}

const load = cache((slug: string) =>
  serverGet<ListingDetail>(`/listings/${encodeURIComponent(slug)}`),
);

function describe(listing: ListingDetail) {
  const car = listing.car;
  const facts = car ? [formatKm(car.kmDriven), label(car.fuelType), label(car.transmission)] : [];
  return `${listing.title} for ${formatPrice(listing.price)} in ${listing.district?.name ?? 'Kerala'}. ${facts.join(', ')}. Contact the seller privately on Angadi.`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { status, body } = await load(slug);
  if (status !== 200 || !body?.data)
    return { title: 'Car not available', robots: { index: false } };
  const listing = body.data;
  const image = listing.images[0]?.urls.detail;
  return {
    title: `${listing.title} — ${formatPrice(listing.price)}`,
    description: describe(listing),
    alternates: { canonical: routes.listing(slug) },
    openGraph: {
      title: listing.title,
      description: describe(listing),
      images: image ? [image] : [],
    },
  };
}

/** Structured data so search engines understand the vehicle and its price. */
function JsonLd({ listing }: { listing: ListingDetail }) {
  const car = listing.car;
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    name: listing.title,
    image: listing.images.map((image) => image.urls.detail),
    brand: car ? { '@type': 'Brand', name: car.brand.name } : undefined,
    model: car?.model.name,
    vehicleModelDate: car?.manufacturingYear,
    fuelType: car ? label(car.fuelType) : undefined,
    mileageFromOdometer: car
      ? { '@type': 'QuantitativeValue', value: car.kmDriven, unitCode: 'KMT' }
      : undefined,
    offers: {
      '@type': 'Offer',
      price: listing.price,
      priceCurrency: 'INR',
      availability: 'https://schema.org/InStock',
      areaServed: listing.district?.name,
    },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default async function CarPage({ params }: Props) {
  const { slug } = await params;
  const { status, body } = await load(slug);
  if (status === 410)
    return <UnavailableListingState info={body?.error?.details as UnavailableListing} />;
  if (status !== 200 || !body?.data) notFound();
  return (
    <>
      <JsonLd listing={body.data} />
      <ListingDetailScreen slug={slug} initialData={body.data} />
    </>
  );
}
