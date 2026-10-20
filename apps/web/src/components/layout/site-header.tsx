'use client';

import { Bell, Heart, MessageSquareText } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUnreadCount } from '@/features/notifications/use-unread-count';
import { SearchBar } from '@/features/search/search-bar';
import { routes } from '@/lib/routes';
import { DistrictStrip } from './district-strip';
import { Logo } from './logo';
import { PublicOnly } from './public-only';
import { SellButton } from './sell-button';
import { UserMenuLink } from './user-menu-link';

function BellLink() {
  const unread = useUnreadCount();
  return (
    <Link
      href={routes.notifications()}
      aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
      className="relative flex size-10 items-center justify-center rounded-full text-ink hover:bg-ink/5"
    >
      <Bell className="size-5" />
      {unread > 0 && (
        <span className="absolute top-1 right-1 min-w-4 rounded-full bg-danger px-1 text-center text-[10px] leading-4 font-bold text-surface">
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}

const navLink =
  'hidden items-center gap-1.5 rounded-button px-2.5 py-2 text-sm font-medium whitespace-nowrap text-ink hover:bg-ink/5 lg:flex';

/** Two-tier marketplace bar: identity + search + account, then a district strip on discovery pages. */
export function SiteHeader() {
  // Home carries its own large search field; the header copy would be a duplicate on phones.
  const isHome = usePathname() === '/';
  return (
    <>
      <header className="safe-top sticky top-0 z-40 border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-3 px-4 md:gap-5 md:px-6">
          <Logo />
          <SearchBar variant="compact" className="hidden md:flex" />
          <nav className="ml-auto flex items-center gap-1" aria-label="Account">
            <Link href={routes.favourites()} className={navLink}>
              <Heart className="size-4" aria-hidden /> Saved
            </Link>
            <Link href={routes.requests()} className={navLink}>
              <MessageSquareText className="size-4" aria-hidden /> Requests
            </Link>
            <BellLink />
            <UserMenuLink />
            <SellButton className="ml-2 hidden md:flex" />
          </nav>
        </div>
      </header>
      {/* Second tier scrolls away so sticky filters and price panels keep their 4rem offset. */}
      <PublicOnly>
        <div className="border-b border-line bg-surface">
          {!isHome && (
            <div className="px-4 pt-3 pb-1 md:hidden">
              <SearchBar variant="compact" />
            </div>
          )}
          <DistrictStrip />
        </div>
      </PublicOnly>
    </>
  );
}
