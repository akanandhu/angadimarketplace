'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { StatusBadge } from '@/components/ui/feedback';
import { Tabs } from '@/components/ui/tabs';
import { AdminTable } from '@/features/admin/admin-table';
import { ModerationAction } from '@/features/admin/moderation-action';
import { adminApi, AdminReportRow } from '@/lib/api/endpoints/admin';
import { timeAgo } from '@/lib/format';
import { keys } from '@/lib/query/keys';
import { routes } from '@/lib/routes';

type Status = 'OPEN' | 'RESOLVED' | 'DISMISSED';
const label = (reason: string) =>
  reason.charAt(0) + reason.slice(1).toLowerCase().replace(/_/g, ' ');

export default function AdminReportsPage() {
  const [status, setStatus] = useState<Status>('OPEN');
  const [page, setPage] = useState(1);
  const params = { status, page };
  const reports = useQuery({
    queryKey: keys.admin('reports', params),
    queryFn: () => adminApi.reports(params),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reports</h1>
      <Tabs
        label="Report status"
        value={status}
        onChange={(value) => {
          setStatus(value);
          setPage(1);
        }}
        tabs={[
          { value: 'OPEN', label: 'Open' },
          { value: 'RESOLVED', label: 'Resolved' },
          { value: 'DISMISSED', label: 'Dismissed' },
        ]}
      />
      <AdminTable<AdminReportRow>
        page={reports.data}
        rowKey={(row) => row.id}
        onPage={setPage}
        empty="No reports"
        columns={[
          {
            header: 'Listing',
            cell: (r) => (
              <>
                {r.listing.slug && r.listing.status === 'ACTIVE' ? (
                  <Link href={routes.listing(r.listing.slug)} className="font-medium text-brand">
                    {r.listing.title}
                  </Link>
                ) : (
                  <span className="font-medium">{r.listing.title}</span>
                )}
                <div className="mt-1">
                  <StatusBadge status={r.listing.status} />
                </div>
              </>
            ),
          },
          {
            header: 'Reporter',
            cell: (r) => (
              <>
                <p>{r.reporter.name ?? '—'}</p>
                <p className="text-xs text-muted">{r.reporter.phone}</p>
              </>
            ),
          },
          {
            header: 'Reason',
            cell: (r) => (
              <>
                <p className="font-medium">{label(r.reason)}</p>
                {r.details && <p className="mt-1 max-w-xs text-xs text-muted">{r.details}</p>}
              </>
            ),
          },
          { header: 'Date', cell: (r) => timeAgo(r.createdAt) },
          {
            header: 'Actions',
            cell: (r) =>
              r.status === 'OPEN' ? (
                <div className="flex flex-wrap gap-1.5">
                  <ModerationAction
                    label="Remove listing"
                    title="Remove the reported listing?"
                    destructive
                    run={(note) => adminApi.removeListing(r.listing.id, note)}
                  />
                  <ModerationAction
                    label="Resolve"
                    title="Resolve this report?"
                    run={(note) => adminApi.resolve(r.id, note)}
                  />
                  <ModerationAction
                    label="Dismiss"
                    title="Dismiss this report?"
                    run={(note) => adminApi.dismiss(r.id, note)}
                  />
                </div>
              ) : (
                <span className="text-xs text-muted">{r.resolutionNote ?? '—'}</span>
              ),
          },
        ]}
      />
    </div>
  );
}
