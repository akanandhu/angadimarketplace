'use client';

import { Heart, Home, MessageSquareText, Plus, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-provider';
import { cn } from '@/lib/cn';
import { routes } from '@/lib/routes';

const ITEMS = [
  { href: routes.home(), label: 'Home', icon: Home, protected: false },
  { href: routes.favourites(), label: 'Saved', icon: Heart, protected: true },
  { href: routes.requests(), label: 'Requests', icon: MessageSquareText, protected: true },
  { href: routes.profile(), label: 'Profile', icon: User, protected: true },
];

/** Mobile-only bottom navigation with a prominent Sell action in the middle. */
export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { requireAuth } = useAuth();
  // Listing pages and the sell wizard have their own sticky action bars.
  const hidden = ['/car/', '/listing', '/sell'].some((prefix) => pathname.startsWith(prefix));
  const go = (href: string, needsAuth: boolean) =>
    needsAuth ? requireAuth(() => router.push(href)) : router.push(href);

  const item = ({ href, label, icon: Icon, protected: needsAuth }: (typeof ITEMS)[number]) => {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        onClick={(event) => {
          event.preventDefault();
          go(href, needsAuth);
        }}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
          active ? 'text-brand' : 'text-muted',
        )}
      >
        <Icon className="size-5" aria-hidden />
        {label}
      </Link>
    );
  };

  if (hidden) return null;
  return (
    <nav
      aria-label="Main"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface md:hidden"
    >
      <div className="flex items-end">
        {ITEMS.slice(0, 2).map(item)}
        <button
          type="button"
          onClick={() => go(routes.sell(), true)}
          className="flex flex-1 flex-col items-center pb-2 text-[11px] font-bold text-ink"
        >
          <span className="-mt-5 mb-0.5 flex size-12 items-center justify-center rounded-full border-4 border-surface bg-gold shadow-raised">
            <Plus className="size-6" strokeWidth={3} aria-hidden />
          </span>
          Sell
        </button>
        {ITEMS.slice(2).map(item)}
      </div>
    </nav>
  );
}
