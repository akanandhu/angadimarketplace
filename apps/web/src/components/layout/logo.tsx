import Link from 'next/link';
import { cn } from '@/lib/cn';

/** Wordmark: a market-stall awning in turmeric over backwater teal, set beside a heavy lowercase name. */
export function Logo({ compact, inverted }: { compact?: boolean; inverted?: boolean }) {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Angadi home">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect
          width="32"
          height="32"
          rx="6"
          fill={inverted ? 'var(--color-ink-soft)' : 'var(--color-ink)'}
        />
        <path d="M5 13 8 6h16l3 7Z" fill="var(--color-gold)" />
        <path
          d="M5 13h22v1.6a3.67 3.67 0 0 1-7.33 0 3.67 3.67 0 0 1-7.34 0A3.67 3.67 0 0 1 5 14.6Z"
          fill="var(--color-surface)"
        />
        <path d="M9 20h14v6H9z" fill="var(--color-gold)" />
      </svg>
      {!compact && (
        <span
          className={cn(
            'font-display text-[1.6rem] leading-none font-bold tracking-[-0.04em]',
            inverted ? 'text-surface' : 'text-ink',
          )}
        >
          angadi
        </span>
      )}
    </Link>
  );
}
