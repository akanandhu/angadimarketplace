import { CheckCircle2, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import type { SellerListing } from '@/lib/api/types';
import { SITE_URL } from '@/lib/env';
import { formatPrice } from '@/lib/format';
import { routes, shareUrl } from '@/lib/routes';

export function PublishSuccess({ listing }: { listing: SellerListing }) {
  const slug = listing.slug!;
  const text = `${listing.title} for ${formatPrice(listing.price)} on Angadi\n${shareUrl(SITE_URL, slug)}`;
  const button = 'flex h-12 items-center justify-center gap-2 rounded-button font-semibold';
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-12 text-center">
      <CheckCircle2 className="size-16 text-success" aria-hidden />
      <h1 className="mt-4 text-2xl font-bold">Your car is live!</h1>
      <p className="mt-1 text-sm text-muted">{listing.title}</p>
      <div className="mt-8 grid w-full gap-3">
        <Link href={routes.listing(slug)} className={`${button} bg-brand text-white`}>
          View listing
        </Link>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(text)}`}
          target="_blank"
          rel="noreferrer"
          className={`${button} bg-[#1f8f4e] text-white`}
        >
          <MessageCircle className="size-5" aria-hidden /> Share on WhatsApp
        </a>
        <Link href={routes.myListings()} className={`${button} border border-line-strong`}>
          Go to My Listings
        </Link>
      </div>
    </div>
  );
}
