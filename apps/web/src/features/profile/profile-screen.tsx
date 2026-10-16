'use client';

import { ChevronRight, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/auth-provider';
import type { Me } from '@/lib/api/types';
import { routes } from '@/lib/routes';
import { AccountSettings } from './account-settings';
import { ProfileForm } from './profile-form';

const card = 'rounded-card border border-line bg-surface p-5';

export function ProfileScreen({ me }: { me: Me }) {
  const router = useRouter();
  const { logout } = useAuth();
  const links = [
    { href: routes.myListings(), label: 'My listings' },
    { href: routes.requests(), label: 'Contact requests' },
    { href: routes.favourites(), label: 'Saved cars' },
    ...(me.dealerProfile
      ? [{ href: routes.dealer(me.dealerProfile.slug), label: 'My public dealer page' }]
      : []),
    ...(me.role === 'ADMIN' ? [{ href: '/admin', label: 'Admin console' }] : []),
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold">Profile & settings</h1>
      <section className={card} aria-label="Profile">
        <ProfileForm me={me} />
      </section>
      <section className={card} aria-label="Account">
        <AccountSettings me={me} />
      </section>
      <nav
        className="divide-y divide-line rounded-card border border-line bg-surface"
        aria-label="Your activity"
      >
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between px-5 py-4 text-sm font-medium hover:bg-canvas"
          >
            {link.label} <ChevronRight className="size-4 text-muted" aria-hidden />
          </Link>
        ))}
      </nav>
      <Button
        variant="outline"
        block
        onClick={async () => {
          await logout();
          router.push('/');
        }}
      >
        <LogOut className="size-4" aria-hidden /> Log out
      </Button>
    </div>
  );
}
