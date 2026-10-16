'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { ToastProvider } from '@/components/ui/toast';
import { AuthProvider } from '@/features/auth/auth-provider';
import { NativeBridge } from '@/features/native/native-bridge';
import { createQueryClient } from '@/lib/query/client';

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(createQueryClient);
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          {children}
          <NativeBridge />
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}
