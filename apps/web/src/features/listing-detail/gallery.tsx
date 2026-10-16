'use client';

import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CarImage } from '@/features/listings/car-image';
import type { ListingDetail } from '@/lib/api/types';
import { cn } from '@/lib/cn';

type Images = ListingDetail['images'];

export function Gallery({ images, title }: { images: Images; title: string }) {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const count = images.length;
  const go = (delta: number) => setIndex((i) => (i + delta + count) % count);

  useEffect(() => {
    if (!fullscreen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFullscreen(false);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const current = images[index];
  const alt = (i: number) => `${title} — photo ${i + 1} of ${count}`;
  const arrow = 'absolute top-1/2 -translate-y-1/2 rounded-full bg-surface/90 p-2 shadow-card';

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden bg-ink md:rounded-card">
        <CarImage
          src={current?.urls.detail}
          alt={alt(index)}
          eager
          className="aspect-[4/3] w-full object-contain md:aspect-[16/10]"
        />
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => go(-1)}
              className={cn(arrow, 'left-3')}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(1)}
              className={cn(arrow, 'right-3')}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-ink/75 px-2.5 py-1 text-xs font-semibold text-white">
          {count ? `${index + 1} / ${count}` : 'No photos'}
        </span>
        {count > 0 && (
          <button
            type="button"
            aria-label="View fullscreen"
            onClick={() => setFullscreen(true)}
            className="absolute right-3 bottom-3 rounded-full bg-ink/75 p-2 text-white"
          >
            <Expand className="size-4" />
          </button>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto px-4 md:px-0" role="list" aria-label="Photos">
          {images.map((image, i) => (
            <button
              key={image.id}
              type="button"
              role="listitem"
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              onClick={() => setIndex(i)}
              className={cn(
                'shrink-0 overflow-hidden rounded-md border-2',
                i === index ? 'border-brand' : 'border-transparent opacity-80',
              )}
            >
              <CarImage src={image.urls.thumb} alt="" className="h-14 w-20" />
            </button>
          ))}
        </div>
      )}

      {fullscreen && current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black"
        >
          <CarImage
            src={current.urls.detail}
            alt={alt(index)}
            className="max-h-full max-w-full object-contain"
          />
          <button
            type="button"
            aria-label="Close"
            onClick={() => setFullscreen(false)}
            className="safe-top absolute top-4 right-4 rounded-full bg-white/15 p-2 text-white"
          >
            <X className="size-6" />
          </button>
          {count > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous photo"
                onClick={() => go(-1)}
                className={cn(arrow, 'left-4')}
              >
                <ChevronLeft className="size-6" />
              </button>
              <button
                type="button"
                aria-label="Next photo"
                onClick={() => go(1)}
                className={cn(arrow, 'right-4')}
              >
                <ChevronRight className="size-6" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
