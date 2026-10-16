'use client';

import { useQuery } from '@tanstack/react-query';
import { contactApi } from '@/lib/api/endpoints/contact';
import { keys } from '@/lib/query/keys';
import { useAuth } from '../auth/auth-provider';

export function useContactState(sellerId: string, listingId?: string, enabled = true) {
  const { status } = useAuth();
  return useQuery({
    queryKey: keys.contactState(sellerId, listingId),
    queryFn: () => contactApi.state(sellerId, listingId),
    enabled: enabled && status === 'authenticated',
  });
}
