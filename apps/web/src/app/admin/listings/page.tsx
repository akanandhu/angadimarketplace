'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { StatusBadge } from '@/components/ui/feedback';
import { AdminTable } from '@/features/admin/admin-table';
import { ModerationAction } from '@/features/admin/moderation-action';
import { adminApi, AdminListingRow } from '@/lib/api/endpoints/admin';
import { formatPrice, timeAgo } from '@/lib/format';
import { keys } from '@/lib/query/keys';
import { routes } from '@/lib/routes';

export default function AdminListingsPage() {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const params = { status: status || undefined, q: q || undefined, page };
  const listings = useQuery({
    queryKey: keys.admin('listings', params),
    queryFn: () => adminApi.listings(params),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Listings</h1>
      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          aria-label="Search listings"
          placeholder="Search title"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-input border border-line-strong px-3 text-sm"
        />
        <select
          aria-label="Status"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-input border border-line-strong px-2 text-sm"
        >
          <option value="">All statuses</option>
          {['ACTIVE', 'SOLD', 'REMOVED'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <AdminTable<AdminListingRow>
        page={listings.data}
        rowKey={(row) => row.id}
        onPage={setPage}
        empty="No listings"
        columns={[
          {
            header: 'Vehicle',
            cell: (r) =>
              r.slug && r.status === 'ACTIVE' ? (
                <Link className="font-medium text-brand" href={routes.listing(r.slug)}>
                  {r.title}
                </Link>
              ) : (
                <span className="font-medium">{r.title ?? 'Untitled'}</span>
              ),
          },
          {
            header: 'Seller',
            cell: (r) => (
              <>
                <p>{r.seller.name ?? '—'}</p>
                <p className="text-xs text-muted">{r.seller.phone}</p>
              </>
            ),
          },
          { header: 'District', cell: (r) => r.district ?? '—' },
          { header: 'Price', cell: (r) => formatPrice(r.price) },
          { header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
          { header: 'Published', cell: (r) => timeAgo(r.publishedAt) },
          {
            header: 'Reports',
            cell: (r) =>
              r.openReports ? <span className="font-bold text-danger">{r.openReports}</span> : '0',
          },
          {
            header: 'Actions',
            cell: (r) =>
              r.status === 'REMOVED' && r.removedByAdmin ? (
                <ModerationAction
                  label="Restore"
                  title="Restore this listing?"
                  withNote={false}
                  run={() => adminApi.restoreListing(r.id)}
                />
              ) : r.status !== 'REMOVED' ? (
                <ModerationAction
                  label="Remove"
                  title="Remove this listing?"
                  destructive
                  run={(note) => adminApi.removeListing(r.id, note)}
                />
              ) : null,
          },
        ]}
      />
    </div>
  );
}
