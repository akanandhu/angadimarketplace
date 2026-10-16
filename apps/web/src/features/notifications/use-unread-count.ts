'use client';

import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '@/lib/api/endpoints/contact';
import { keys } from '@/lib/query/keys';
import { useAuth } from '../auth/auth-provider';

export function useUnreadCount() {
  const { status } = useAuth();
  const query = useQuery({
    queryKey: keys.unread,
    queryFn: notificationsApi.unreadCount,
    enabled: status === 'authenticated',
    refetchInterval: 60_000,
  });
  return query.data?.count ?? 0;
}
