import { cn } from '@/lib/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  id: string;
}

/** Accessible switch with a visible label. */
export function Toggle({ checked, onChange, label, description, id }: ToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-7 w-12 shrink-0 rounded-full transition-colors',
          checked ? 'bg-ink' : 'bg-line-strong',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 size-6 rounded-full bg-surface shadow transition-transform',
            checked && 'translate-x-5',
          )}
        />
      </button>
    </div>
  );
}

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  id: string;
}

export function Checkbox({ checked, onChange, label, id }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-ink">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 size-5 shrink-0 accent-ink"
      />
      <span className="font-medium">{label}</span>
    </label>
  );
}
