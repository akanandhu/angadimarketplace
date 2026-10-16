'use client';

import { Bell, Heart, MessageSquareText, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-provider';
import { useUnreadCount } from '@/features/notifications/use-unread-count';
import { SearchBar } from '@/features/search/search-bar';
import { routes } from '@/lib/routes';
import { Logo } from './logo';
import { UserMenuLink } from './user-menu-link';

function BellLink() {
  const unread = useUnreadCount();
  return (
    <Link
      href={routes.notifications()}
      aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
      className="relative rounded-full p-2 text-ink hover:bg-ink/5"
    >
      <Bell className="size-5" />
      {unread > 0 && (
        <span className="absolute top-1 right-1 min-w-4 rounded-full bg-danger px-1 text-center text-[10px] leading-4 font-bold text-white">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const { requireAuth } = useAuth();
  const sell = () => requireAuth(() => router.push(routes.sell()));

  return (
    <header className="safe-top sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-4 px-4 md:px-6">
        <Logo />
        <SearchBar compact className="hidden max-w-2xl md:grid" />
        <nav className="ml-auto flex items-center gap-1" aria-label="Account">
          <Link
            href={routes.favourites()}
            className="hidden items-center gap-1.5 rounded-button px-3 py-2 text-sm font-medium hover:bg-ink/5 md:flex"
          >
            <Heart className="size-4" /> Saved
          </Link>
          <Link
            href={routes.requests()}
            className="hidden items-center gap-1.5 rounded-button px-3 py-2 text-sm font-medium hover:bg-ink/5 md:flex"
          >
            <MessageSquareText className="size-4" /> Requests
          </Link>
          <BellLink />
          <UserMenuLink />
          <button
            type="button"
            onClick={sell}
            className="ml-2 hidden h-10 items-center gap-1.5 rounded-full border-2 border-gold bg-gold-soft px-5 text-sm font-extrabold tracking-wide text-ink hover:bg-gold md:flex"
          >
            <Plus className="size-4" strokeWidth={3} /> SELL
          </button>
        </nav>
      </div>
    </header>
  );
}
