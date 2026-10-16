import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BrowseScreen } from '@/features/search/browse-screen';
import { routes } from '@/lib/routes';
import { loadBrowse } from './load';

interface Props {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const data = await loadBrowse((await params).segments, await searchParams);
  if (!data) return {};
  const { districtSlug, brandSlug, modelSlug } = data.filters;
  // Filtered/paged variants point at the clean landing page.
  const canonical = routes.browse({ districtSlug, brandSlug, modelSlug });
  return {
    title: data.heading,
    description: data.description,
    alternates: { canonical },
    openGraph: { title: data.heading, description: data.description, url: canonical },
  };
}

/** SEO landing pages: /cars, /cars/ernakulam, /cars/hyundai, /cars/ernakulam/hyundai/creta */
export default async function CarsPage({ params, searchParams }: Props) {
  const data = await loadBrowse((await params).segments, await searchParams);
  if (!data) notFound();
  return (
    <BrowseScreen filters={data.filters} initialData={data.initialData} heading={data.heading} />
  );
}
