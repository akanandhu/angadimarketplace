import { Eye, Heart, MessageSquareText, PhoneCall } from 'lucide-react';
import type { ListingStats } from '@/lib/api/types';
import { formatNumber } from '@/lib/format';

/** Small metric tiles — Angadi-owned numbers, not analytics estimates. */
export function ListingMetrics({ stats }: { stats: ListingStats }) {
  const items = [
    { icon: Eye, label: 'Views', value: stats.views },
    { icon: Heart, label: 'Saves', value: stats.favourites },
    { icon: MessageSquareText, label: 'Requests', value: stats.contactRequests },
    { icon: PhoneCall, label: 'Contacts shared', value: stats.contactApprovals },
  ];
  return (
    <dl className="grid grid-cols-4 gap-2">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="rounded-button bg-canvas px-2 py-2 text-center">
          <dd className="flex items-center justify-center gap-1 text-sm font-bold">
            <Icon className="size-3.5 text-muted" aria-hidden />
            {formatNumber(value)}
          </dd>
          <dt className="text-[11px] leading-tight text-muted">{label}</dt>
        </div>
      ))}
    </dl>
  );
}
