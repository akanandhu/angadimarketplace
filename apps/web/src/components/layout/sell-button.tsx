'use client';

import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-provider';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/routes';

/** The site's primary seller action: a turmeric pill, the only yellow button in the header. */
export function SellButton({ className, label = 'Sell' }: { className?: string; label?: string }) {
  const router = useRouter();
  const { requireAuth } = useAuth();
  return (
    <button
      type="button"
      onClick={() => requireAuth(() => router.push(routes.sell()))}
      className={cn(
        'flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-gold px-5 text-[15px] font-semibold whitespace-nowrap text-ink shadow-card transition-colors hover:bg-gold-strong',
        className,
      )}
    >
      <Plus className="size-4" strokeWidth={2.5} aria-hidden /> {label}
    </button>
  );
}
