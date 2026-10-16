'use client';

import { Check, ChevronDown, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Sheet } from '@/components/ui/sheet';
import { cn } from '@/lib/cn';

interface Option {
  value: string;
  label: string;
}

interface Props {
  id: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  footer?: React.ReactNode;
}

/** Button that opens a searchable list in a bottom sheet (brand, model, variant, district). */
export function SearchableSelect({
  id,
  label,
  value,
  options,
  onChange,
  placeholder,
  disabled,
  invalid,
  footer,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((option) => option.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  const choose = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-invalid={invalid}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={cn(
          'flex h-11 w-full items-center justify-between rounded-input border border-line-strong bg-surface px-3 text-left text-[15px] disabled:bg-canvas disabled:text-muted aria-[invalid=true]:border-danger',
          !selected && 'text-muted',
        )}
      >
        <span className="truncate">
          {selected?.label ?? placeholder ?? `Select ${label.toLowerCase()}`}
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted" aria-hidden />
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={`Select ${label.toLowerCase()}`}>
        <div className="relative mb-3">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            autoFocus
            aria-label={`Search ${label.toLowerCase()}`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search..."
            className="h-11 w-full rounded-input border border-line-strong pr-3 pl-9 focus:border-brand focus:outline-none"
          />
        </div>
        <ul role="listbox" aria-label={label} className="divide-y divide-line">
          {filtered.map((option) => (
            <li key={option.value} role="option" aria-selected={option.value === value}>
              <button
                type="button"
                onClick={() => choose(option.value)}
                className="flex w-full items-center justify-between py-3 text-left text-[15px] hover:text-brand"
              >
                {option.label}
                {option.value === value && <Check className="size-4 text-brand" aria-hidden />}
              </button>
            </li>
          ))}
          {!filtered.length && <li className="py-6 text-center text-sm text-muted">No matches</li>}
        </ul>
        {footer && <div className="mt-3 border-t border-line pt-3">{footer}</div>}
      </Sheet>
    </>
  );
}
