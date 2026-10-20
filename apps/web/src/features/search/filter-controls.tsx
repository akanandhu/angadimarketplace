import { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const selectClass =
  'h-10 w-full rounded-input border border-line-strong bg-surface px-2.5 text-sm focus:border-ink focus:ring-1 focus:ring-ink focus:outline-none';

export function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-2.5 border-b border-line py-4 last:border-0">
      <legend className="float-left mb-2.5 w-full font-display text-[15px] font-bold tracking-tight">
        {title}
      </legend>
      <div className="clear-both space-y-2.5">{children}</div>
    </fieldset>
  );
}

interface Option {
  value: string;
  label: string;
}

/** Labelled native select; `value` '' means "Any". */
export function OptionSelect(props: {
  id: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  anyLabel?: string;
  disabled?: boolean;
}) {
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={props.id} className="sr-only">
        {props.label}
      </label>
      <select
        id={props.id}
        value={props.value}
        disabled={props.disabled}
        onChange={(event) => props.onChange(event.target.value)}
        className={cn(selectClass, props.disabled && 'bg-canvas text-muted')}
      >
        <option value="">{props.anyLabel ?? 'Any'}</option>
        {props.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Multi-select pills (fuel, transmission). */
export function ChipGroup(props: {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
}) {
  const toggle = (value: string) =>
    props.onChange(
      props.selected.includes(value)
        ? props.selected.filter((item) => item !== value)
        : [...props.selected, value],
    );
  return (
    <div className="flex flex-wrap gap-2">
      {props.options.map((option) => {
        const active = props.selected.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(option.value)}
            className={cn(
              'rounded-full border px-3.5 py-1.5 text-sm font-medium',
              active
                ? 'border-ink bg-ink text-surface'
                : 'border-line-strong bg-surface hover:border-ink',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
