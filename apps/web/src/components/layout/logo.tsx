import Link from 'next/link';

/** Wordmark: a market-stall awning mark in Kerala green with a gold accent. */
export function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Angadi home">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect width="32" height="32" rx="8" fill="var(--color-brand)" />
        <path d="M6 12 8.5 7h15L26 12" fill="var(--color-gold)" />
        <path
          d="M6 12h20v2.5a3.3 3.3 0 0 1-6.6 0 3.3 3.3 0 0 1-6.8 0A3.3 3.3 0 0 1 6 14.5Z"
          fill="#fff"
        />
        <path d="M9 19h14v6H9z" fill="#fff" opacity=".9" />
      </svg>
      {!compact && <span className="text-xl font-extrabold tracking-tight text-ink">angadi</span>}
    </Link>
  );
}
