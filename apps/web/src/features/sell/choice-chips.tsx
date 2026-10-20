import { cn } from '@/lib/cn';

interface Props<T extends string | number> {
  name: string;
  value: T | undefined;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}

/** Single-choice pill group (radio semantics). */
export function ChoiceChips<T extends string | number>({
  name,
  value,
  options,
  onChange,
}: Props<T>) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={String(option.value)}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            'min-h-11 rounded-full border px-4 text-sm font-medium',
            value === option.value
              ? 'border-ink bg-ink text-surface'
              : 'border-line-strong bg-surface hover:border-brand',
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
