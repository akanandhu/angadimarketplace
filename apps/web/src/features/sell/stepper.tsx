export const SELL_STEPS = [
  'Vehicle',
  'Registration & condition',
  'Price',
  'Location',
  'Photos',
  'Description',
  'Preview',
] as const;

export function Stepper({ step }: { step: number }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted">
        Step {step + 1} of {SELL_STEPS.length} ·{' '}
        <span className="text-ink">{SELL_STEPS[step]}</span>
      </p>
      <div className="flex gap-1" aria-hidden>
        {SELL_STEPS.map((name, index) => (
          <span
            key={name}
            className={`h-1.5 flex-1 rounded-full ${index <= step ? 'bg-ink' : 'bg-line'}`}
          />
        ))}
      </div>
    </div>
  );
}
