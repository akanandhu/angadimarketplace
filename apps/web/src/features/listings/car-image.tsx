'use client';

import { Car } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';

interface Props {
  src: string | null | undefined;
  alt: string;
  className?: string;
  eager?: boolean;
}

/** Image with a neutral placeholder for missing or failed photos. */
export function CarImage({ src, alt, className, eager }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className={cn('flex items-center justify-center bg-line/60 text-muted', className)}>
        <Car className="size-10" aria-hidden />
        <span className="sr-only">{alt} (no photo)</span>
      </div>
    );
  }
  return (
    // Variants are pre-sized WebP from the CDN; next/image optimisation is unnecessary.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
      className={cn('bg-line/60 object-cover', className)}
    />
  );
}
