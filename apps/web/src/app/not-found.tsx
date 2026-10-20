import { SearchX } from 'lucide-react';
import Link from 'next/link';
import { EmptyState } from '@/components/ui/feedback';

export default function NotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="Page not found"
      description="The page you're looking for doesn't exist or has moved."
      action={
        <Link
          href="/cars"
          className="inline-flex h-11 items-center rounded-button bg-ink px-5 text-sm font-semibold text-surface hover:bg-ink-soft"
        >
          Browse cars
        </Link>
      }
    />
  );
}
