'use client';

import { User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/features/auth/auth-provider';
import { routes } from '@/lib/routes';

/** Avatar link to the profile, or a login button for visitors. */
export function UserMenuLink() {
  const { status, me, requireAuth } = useAuth();
  if (status !== 'authenticated' || !me) {
    return (
      <button
        type="button"
        onClick={() => requireAuth()}
        className="rounded-button px-3 py-2 text-sm font-semibold text-ink hover:bg-ink/5"
      >
        Login
      </button>
    );
  }
  return (
    <Link
      href={routes.profile()}
      aria-label="Your profile"
      className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-brand-soft text-brand"
    >
      {me.profileImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={me.profileImageUrl} alt="" className="size-full object-cover" />
      ) : me.name ? (
        <span className="text-sm font-bold">{me.name.charAt(0).toUpperCase()}</span>
      ) : (
        <User className="size-4" />
      )}
    </Link>
  );
}
