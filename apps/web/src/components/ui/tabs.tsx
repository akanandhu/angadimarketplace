import { cn } from '@/lib/cn';

interface TabsProps<T extends string> {
  tabs: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

export function Tabs<T extends string>({ tabs, value, onChange, label }: TabsProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className="flex gap-1 overflow-x-auto border-b border-line"
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          role="tab"
          type="button"
          aria-selected={tab.value === value}
          onClick={() => onChange(tab.value)}
          className={cn(
            '-mb-px shrink-0 border-b-[3px] px-4 py-3 text-sm font-semibold whitespace-nowrap transition-colors',
            tab.value === value
              ? 'border-ink text-ink'
              : 'border-transparent text-muted hover:text-ink',
          )}
        >
          {tab.label}
          {tab.count != null && <span className="ml-1.5 text-xs">({tab.count})</span>}
        </button>
      ))}
    </div>
  );
}
