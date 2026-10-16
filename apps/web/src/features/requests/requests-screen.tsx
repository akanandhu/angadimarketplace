'use client';

import { useQuery } from '@tanstack/react-query';
import { Inbox } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { Tabs } from '@/components/ui/tabs';
import { contactApi } from '@/lib/api/endpoints/contact';
import { errorMessage } from '@/lib/api/errors';
import type { ContactRequestStatus } from '@/lib/api/types';
import { keys } from '@/lib/query/keys';
import { routes } from '@/lib/routes';
import { IncomingRequestCard } from './incoming-request-card';
import { OutgoingRequestCard } from './outgoing-request-card';

type View = 'received' | 'sent';
const STATUSES: { value: ContactRequestStatus; label: string }[] = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

export function RequestsScreen() {
  const router = useRouter();
  const view: View = useSearchParams().get('view') === 'sent' ? 'sent' : 'received';
  const [status, setStatus] = useState<ContactRequestStatus>('PENDING');

  const incoming = useQuery({
    queryKey: keys.incoming(status),
    queryFn: () => contactApi.incoming(status),
    enabled: view === 'received',
  });
  const outgoing = useQuery({
    queryKey: keys.outgoing(status),
    queryFn: () => contactApi.outgoing(status),
    enabled: view === 'sent',
  });
  const active = view === 'received' ? incoming : outgoing;

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-6">
      <h1 className="text-2xl font-bold">Contact requests</h1>
      <div
        className="grid grid-cols-2 rounded-button bg-line/60 p-1"
        role="group"
        aria-label="Request direction"
      >
        {(['received', 'sent'] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={view === value}
            onClick={() => router.replace(routes.requests(value))}
            className={`rounded-md py-2 text-sm font-semibold ${view === value ? 'bg-surface shadow-card' : 'text-muted'}`}
          >
            {value === 'received' ? 'Received (as seller)' : 'Sent (as buyer)'}
          </button>
        ))}
      </div>
      <Tabs label="Request status" tabs={STATUSES} value={status} onChange={setStatus} />

      {active.isError ? (
        <ErrorState message={errorMessage(active.error)} />
      ) : !active.data ? (
        <div className="space-y-3">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : active.data.data.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={
            view === 'received'
              ? 'No contact requests yet'
              : "You haven't requested any seller contacts yet"
          }
          description={
            view === 'received'
              ? 'Requests from interested buyers will appear here.'
              : 'Find a car you like and tap Request contact.'
          }
        />
      ) : (
        <div className="space-y-3">
          {view === 'received'
            ? incoming.data?.data.map((request) => (
                <IncomingRequestCard key={request.id} request={request} />
              ))
            : outgoing.data?.data.map((request) => (
                <OutgoingRequestCard key={request.id} request={request} />
              ))}
        </div>
      )}
    </div>
  );
}
