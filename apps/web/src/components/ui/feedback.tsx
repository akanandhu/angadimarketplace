import { AlertTriangle, LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-line/70', className)} aria-hidden />;
}

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center px-6 py-14 text-center', className)}>
      {Icon && (
        <div className="mb-4 rounded-full bg-gold-soft p-4 text-ink">
          <Icon className="size-7" aria-hidden />
        </div>
      )}
      <h2 className="text-xl font-bold">{title}</h2>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, action }: { message: string; action?: ReactNode }) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Something went wrong"
      description={message}
      action={action}
    />
  );
}

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'gold' | 'ink';

const TONES: Record<Tone, string> = {
  neutral: 'bg-canvas text-muted border-line',
  brand: 'bg-brand-soft text-brand border-brand/20',
  success: 'bg-success-soft text-success border-success/20',
  warning: 'bg-warning-soft text-warning border-warning/20',
  danger: 'bg-danger-soft text-danger border-danger/20',
  gold: 'bg-gold text-ink border-gold',
  ink: 'bg-ink text-surface border-ink',
};

/** Status pill; always carries text so colour is never the only signal. */
export function Badge({ tone = 'neutral', children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap',
        TONES[tone],
      )}
    >
      {children}
    </span>
  );
}

const STATUS_TONES: Record<string, Tone> = {
  DRAFT: 'neutral',
  ACTIVE: 'success',
  SOLD: 'ink',
  REMOVED: 'danger',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  CANCELLED: 'neutral',
  UPLOADING: 'neutral',
  PROCESSING: 'warning',
  READY: 'success',
  FAILED: 'danger',
  SUSPENDED: 'danger',
  DEALER: 'gold',
  INDIVIDUAL: 'neutral',
  OPEN: 'warning',
  RESOLVED: 'success',
  DISMISSED: 'neutral',
};

export function StatusBadge({ status }: { status: string }) {
  const text = status.charAt(0) + status.slice(1).toLowerCase();
  return <Badge tone={STATUS_TONES[status] ?? 'neutral'}>{text}</Badge>;
}
