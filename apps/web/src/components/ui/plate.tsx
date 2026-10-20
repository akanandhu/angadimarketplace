import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/** Number-plate tag for RTO codes (e.g. "KL 07"). Only ever shows the RTO, never a full registration. */
export function Plate({
  children,
  size = 'sm',
  className,
}: {
  children: ReactNode;
  size?: 'sm' | 'lg';
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-[4px] border border-ink-soft bg-surface font-sans leading-none font-semibold tracking-[0.06em] tabular-nums whitespace-nowrap text-ink uppercase shadow-[inset_0_0_0_2px_var(--color-surface),inset_0_0_0_3px_var(--color-line-strong)]',
        size === 'sm' ? 'px-1.5 py-1 text-[11px]' : 'px-2.5 py-1.5 text-sm',
        className,
      )}
    >
      {children}
    </span>
  );
}
