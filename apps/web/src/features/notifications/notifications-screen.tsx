'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCircle2, MessageSquareText, ShieldAlert, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { notificationsApi } from '@/lib/api/endpoints/contact';
import { errorMessage } from '@/lib/api/errors';
import type { AppNotification } from '@/lib/api/types';
import { cn } from '@/lib/cn';
import { timeAgo } from '@/lib/format';
import { keys } from '@/lib/query/keys';
import { routes } from '@/lib/routes';

const ICONS: Record<string, typeof Bell> = {
  CONTACT_REQUEST_RECEIVED: MessageSquareText,
  CONTACT_REQUEST_APPROVED: CheckCircle2,
  CONTACT_REQUEST_REJECTED: XCircle,
};

/** Where tapping a notification takes the user. */
function destination(n: AppNotification): string {
  if (n.type === 'CONTACT_REQUEST_RECEIVED') return routes.requests('received');
  if (n.type.startsWith('CONTACT_REQUEST_')) return routes.requests('sent');
  if (n.type.startsWith('LISTING_')) return routes.myListings();
  return routes.profile();
}

export function NotificationsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const list = useQuery({ queryKey: keys.notifications, queryFn: () => notificationsApi.list() });
  const refresh = () => queryClient.invalidateQueries({ queryKey: keys.notifications });

  const open = async (n: AppNotification) => {
    if (!n.isRead) await notificationsApi.markRead(n.id).catch(() => undefined);
    void refresh();
    router.push(destination(n));
  };
  const readAll = async () => {
    await notificationsApi.markAllRead();
    await refresh();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notifications</h1>
        {list.data?.data.some((n) => !n.isRead) && (
          <Button variant="ghost" size="sm" onClick={readAll}>
            Mark all as read
          </Button>
        )}
      </div>
      {list.isError ? (
        <ErrorState message={errorMessage(list.error)} />
      ) : !list.data ? (
        <Skeleton className="h-64 w-full" />
      ) : list.data.data.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="Contact requests and replies will show up here."
        />
      ) : (
        <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-surface">
          {list.data.data.map((n) => {
            const Icon = ICONS[n.type] ?? ShieldAlert;
            return (
              <li key={n.id}>
                <button
                  type="button"
                  onClick={() => open(n)}
                  className={cn(
                    'flex w-full gap-3 p-4 text-left hover:bg-canvas',
                    !n.isRead && 'bg-brand-soft/40',
                  )}
                >
                  <Icon className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm', !n.isRead && 'font-semibold')}>{n.title}</p>
                    <p className="text-sm text-muted">{n.body}</p>
                    <p className="mt-1 text-xs text-muted">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.isRead && <span className="sr-only">Unread</span>}
                  {!n.isRead && (
                    <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-brand" aria-hidden />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
