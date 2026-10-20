import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PageMeta } from '@/lib/api/types';

export function Pagination({ meta, onPage }: { meta: PageMeta; onPage: (page: number) => void }) {
  if (meta.totalPages <= 1) return null;
  const button =
    'flex h-10 items-center gap-1 rounded-button border border-line-strong bg-surface px-4 text-sm font-semibold whitespace-nowrap hover:border-ink disabled:opacity-40';
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-3 pt-8">
      <button
        type="button"
        className={button}
        disabled={meta.page <= 1}
        onClick={() => onPage(meta.page - 1)}
      >
        <ChevronLeft className="size-4" /> Previous
      </button>
      <span className="text-sm text-muted tabular-nums">
        Page {meta.page} of {meta.totalPages}
      </span>
      <button
        type="button"
        className={button}
        disabled={meta.page >= meta.totalPages}
        onClick={() => onPage(meta.page + 1)}
      >
        Next <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
