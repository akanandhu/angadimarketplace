import { ReactNode } from 'react';
import { Skeleton } from '@/components/ui/feedback';
import { Pagination } from '@/features/search/pagination';
import type { Page } from '@/lib/api/types';

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface Props<T> {
  page: Page<T> | undefined;
  columns: Column<T>[];
  rowKey: (row: T) => string;
  onPage: (page: number) => void;
  empty: string;
}

/** Plain, functional data table with horizontal scroll on narrow screens. */
export function AdminTable<T>({ page, columns, rowKey, onPage, empty }: Props<T>) {
  if (!page) return <Skeleton className="h-64 w-full" />;
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-canvas text-xs tracking-wide text-muted uppercase">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  scope="col"
                  className={`px-4 py-3 font-semibold ${column.className ?? ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {page.data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-muted">
                  {empty}
                </td>
              </tr>
            ) : (
              page.data.map((row) => (
                <tr key={rowKey(row)} className="align-top">
                  {columns.map((column) => (
                    <td key={column.header} className={`px-4 py-3 ${column.className ?? ''}`}>
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted">{page.meta.total} total</p>
      <Pagination meta={page.meta} onPage={onPage} />
    </div>
  );
}
