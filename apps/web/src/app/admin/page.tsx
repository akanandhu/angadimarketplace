'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/feedback';
import { adminApi } from '@/lib/api/endpoints/admin';
import { formatNumber } from '@/lib/format';
import { keys } from '@/lib/query/keys';

export default function AdminOverviewPage() {
  const overview = useQuery({ queryKey: keys.admin('overview', {}), queryFn: adminApi.overview });
  const data = overview.data;
  const cards = data
    ? [
        { label: 'Active listings', value: data.activeListings, href: '/admin/listings' },
        { label: 'Open reports', value: data.openReports, href: '/admin/reports' },
        { label: 'Users', value: data.users, href: '/admin/users' },
        { label: 'Suspended users', value: data.suspendedUsers, href: '/admin/users' },
      ]
    : [];
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Overview</h1>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {data
          ? cards.map((card) => (
              <Link
                key={card.label}
                href={card.href}
                className="rounded-card border border-line bg-surface p-4 hover:border-brand"
              >
                <p className="text-sm text-muted">{card.label}</p>
                <p className="mt-1 text-3xl font-bold">{formatNumber(card.value)}</p>
              </Link>
            ))
          : [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
      </div>
    </div>
  );
}
