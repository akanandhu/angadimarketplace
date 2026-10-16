'use client';

import { Capacitor } from '@capacitor/core';
import { Copy, MessageCircle, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet } from '@/components/ui/sheet';
import { useToast } from '@/components/ui/toast';
import { track } from '@/lib/analytics';
import { SITE_URL } from '@/lib/env';
import { shareUrl } from '@/lib/routes';

interface Props {
  slug: string;
  title: string;
  price: string;
  compact?: boolean;
}

/** Native share on devices, otherwise WhatsApp / copy link. No login required. */
export function ShareButton({ slug, title, price, compact }: Props) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const url = shareUrl(SITE_URL, slug);
  const text = `${title} for ${price} on Angadi`;

  const share = async () => {
    track('listing_shared', { slug });
    if (Capacitor.isNativePlatform()) {
      const { Share } = await import('@capacitor/share');
      await Share.share({ title, text, url }).catch(() => undefined);
      return;
    }
    if (typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches) {
      await navigator.share({ title, text, url }).catch(() => undefined);
      return;
    }
    setOpen(true);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    toast('Link copied');
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={share}
        aria-label="Share"
        className={
          compact
            ? 'flex size-9 items-center justify-center rounded-full bg-surface/90 shadow-card'
            : 'flex items-center gap-1.5 rounded-button border border-line-strong px-3 py-2 text-sm font-semibold hover:bg-canvas'
        }
      >
        <Share2 className="size-[18px]" aria-hidden />
        {!compact && 'Share'}
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Share this car">
        <div className="grid gap-3">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex h-12 items-center justify-center gap-2 rounded-button bg-[#1f8f4e] font-semibold text-white"
          >
            <MessageCircle className="size-5" aria-hidden /> Share on WhatsApp
          </a>
          <Button variant="outline" size="lg" onClick={copy}>
            <Copy className="size-4" aria-hidden /> Copy link
          </Button>
        </div>
      </Sheet>
    </>
  );
}
