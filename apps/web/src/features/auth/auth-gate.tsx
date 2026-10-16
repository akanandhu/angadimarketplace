'use client';

import { LockKeyhole } from 'lucide-react';
import { ReactNode, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState, Skeleton } from '@/components/ui/feedback';
import type { Me } from '@/lib/api/types';
import { useAuth } from './auth-provider';

interface Props {
  children: (me: Me) => ReactNode;
  title?: string;
}

/** Renders children only for logged-in users; prompts login otherwise. */
export function AuthGate({ children, title = 'Log in to continue' }: Props) {
  const { status, me, requireAuth } = useAuth();
  const prompted = useRef(false);

  useEffect(() => {
    if (status === 'anonymous' && !prompted.current) {
      prompted.current = true;
      requireAuth();
    }
  }, [status, requireAuth]);

  if (status === 'loading') {
    return (
      <div className="mx-auto max-w-3xl space-y-3 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  if (status === 'anonymous' || !me) {
    return (
      <EmptyState
        icon={LockKeyhole}
        title={title}
        description="Verify your phone number to continue. It stays private."
        action={<Button onClick={() => requireAuth()}>Log in</Button>}
      />
    );
  }
  return <>{children(me)}</>;
}
