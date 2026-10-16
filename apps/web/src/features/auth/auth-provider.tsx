'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { identify, resetAnalytics } from '@/lib/analytics';
import { refreshSession } from '@/lib/api/client';
import { authApi, meApi } from '@/lib/api/endpoints/auth';
import type { Me } from '@/lib/api/types';
import { tokenStore } from '@/lib/auth/token-store';
import { keys } from '@/lib/query/keys';
import { LoginSheet } from './login-sheet';

type Status = 'loading' | 'authenticated' | 'anonymous';

interface AuthValue {
  status: Status;
  me: Me | undefined;
  /** Runs `action` now if logged in; otherwise opens login and resumes it afterwards. */
  requireAuth: (action?: () => void) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [bootstrapped, setBootstrapped] = useState(false);
  const [hasToken, setHasToken] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const pending = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = tokenStore.subscribe((token) => setHasToken(Boolean(token)));
    // Restore the session from the refresh cookie / secure storage.
    refreshSession().finally(() => setBootstrapped(true));
    return () => {
      unsubscribe();
    };
  }, []);

  const me = useQuery({ queryKey: keys.me, queryFn: meApi.get, enabled: hasToken });

  const status: Status = !bootstrapped
    ? 'loading'
    : hasToken
      ? me.data
        ? 'authenticated'
        : 'loading'
      : 'anonymous';

  const requireAuth = useCallback((action?: () => void) => {
    if (tokenStore.access) return action?.();
    pending.current = action;
    setLoginOpen(true);
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    resetAnalytics();
    queryClient.clear();
  }, [queryClient]);

  const onLoggedIn = useCallback(
    (user: Me) => {
      queryClient.setQueryData(keys.me, user);
      identify(user.id);
      // Anything fetched anonymously (saved flags, contact state) is now stale.
      void queryClient.invalidateQueries({ predicate: (q) => q.queryKey[0] !== 'me' });
      setLoginOpen(false);
      const action = pending.current;
      pending.current = undefined;
      action?.();
    },
    [queryClient],
  );

  return (
    <AuthContext.Provider value={{ status, me: me.data, requireAuth, logout }}>
      {children}
      <LoginSheet
        open={loginOpen}
        onClose={() => {
          pending.current = undefined;
          setLoginOpen(false);
        }}
        onLoggedIn={onLoggedIn}
      />
    </AuthContext.Provider>
  );
}
