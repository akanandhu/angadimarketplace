'use client';

import { CheckCircle2, Info, XCircle } from 'lucide-react';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'success' | 'error' | 'info';
interface ToastItem {
  id: number;
  tone: Tone;
  message: string;
}

const ToastContext = createContext<(message: string, tone?: Tone) => void>(() => undefined);

export const useToast = () => useContext(ToastContext);

const ICONS = { success: CheckCircle2, error: XCircle, info: Info };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const show = useCallback((message: string, tone: Tone = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, tone, message }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 4000);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-60 flex flex-col items-center gap-2 px-4 md:bottom-6"
      >
        {toasts.map((toast) => {
          const Icon = ICONS[toast.tone];
          return (
            <div
              key={toast.id}
              role="status"
              className={cn(
                'pointer-events-auto flex max-w-md items-center gap-2 rounded-card px-4 py-3 text-sm font-medium text-white shadow-raised',
                toast.tone === 'error' ? 'bg-danger' : 'bg-ink',
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {toast.message}
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
