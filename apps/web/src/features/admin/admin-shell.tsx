'use client';

import { Flag, LayoutDashboard, List, ShieldX, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { EmptyState } from '@/components/ui/feedback';
import { AuthGate } from '@/features/auth/auth-gate';
import { cn } from '@/lib/cn';

const NAV = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/listings', label: 'Listings', icon: List },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/reports', label: 'Reports', icon: Flag },
];

/** Admin chrome. The API enforces ADMIN on every call; this only hides the UI. */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AuthGate title="Admin login">
      {(me) =>
        me.role !== 'ADMIN' ? (
          <EmptyState icon={ShieldX} title="You don't have access to this page" />
        ) : (
          <div className="mx-auto flex max-w-[1320px] flex-col gap-6 px-4 py-6 md:flex-row md:px-6">
            <nav
              aria-label="Admin"
              className="flex gap-1 overflow-x-auto md:w-52 md:shrink-0 md:flex-col"
            >
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={pathname === href ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 rounded-button px-3 py-2 text-sm font-medium whitespace-nowrap',
                    pathname === href ? 'bg-ink text-white' : 'hover:bg-ink/5',
                  )}
                >
                  <Icon className="size-4" aria-hidden /> {label}
                </Link>
              ))}
            </nav>
            <div className="min-w-0 flex-1">{children}</div>
          </div>
        )
      }
    </AuthGate>
  );
}
