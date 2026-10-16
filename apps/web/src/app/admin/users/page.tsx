'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { StatusBadge } from '@/components/ui/feedback';
import { AdminTable } from '@/features/admin/admin-table';
import { ModerationAction } from '@/features/admin/moderation-action';
import { adminApi, AdminUserRow } from '@/lib/api/endpoints/admin';
import { memberSince } from '@/lib/format';
import { keys } from '@/lib/query/keys';

export default function AdminUsersPage() {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const params = { status: status || undefined, q: q || undefined, page };
  const users = useQuery({
    queryKey: keys.admin('users', params),
    queryFn: () => adminApi.users(params),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Users</h1>
      <div className="flex flex-wrap gap-2">
        <input
          type="search"
          aria-label="Search users"
          placeholder="Name or phone"
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
          <option value="">All users</option>
          <option value="ACTIVE">Active</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>
      <AdminTable<AdminUserRow>
        page={users.data}
        rowKey={(row) => row.id}
        onPage={setPage}
        empty="No users"
        columns={[
          {
            header: 'Name',
            cell: (r) => (
              <>
                <p className="font-medium">{r.name ?? '—'}</p>
                {r.dealer && <p className="text-xs text-muted">{r.dealer.businessName}</p>}
              </>
            ),
          },
          { header: 'Phone', cell: (r) => r.phone },
          { header: 'Account', cell: (r) => <StatusBadge status={r.accountType} /> },
          {
            header: 'Status',
            cell: (r) => (
              <>
                <StatusBadge status={r.status} />
                {r.suspensionReason && (
                  <p className="mt-1 text-xs text-muted">{r.suspensionReason}</p>
                )}
              </>
            ),
          },
          { header: 'Listings', cell: (r) => r.listingCount },
          { header: 'Since', cell: (r) => memberSince(r.memberSince) },
          {
            header: 'Actions',
            cell: (r) =>
              r.role === 'ADMIN' ? (
                <span className="text-xs text-muted">Admin</span>
              ) : r.status === 'ACTIVE' ? (
                <ModerationAction
                  label="Suspend"
                  title={`Suspend ${r.name ?? r.phone}?`}
                  destructive
                  run={(note) => adminApi.suspend(r.id, note)}
                />
              ) : (
                <ModerationAction
                  label="Unsuspend"
                  title={`Restore ${r.name ?? r.phone}?`}
                  withNote={false}
                  run={() => adminApi.unsuspend(r.id)}
                />
              ),
          },
        ]}
      />
    </div>
  );
}
