import { Button } from '@/components/ui/button';

interface Props {
  onBack?: () => void;
  submitLabel?: string;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  onSubmit?: () => void;
}

/** Sticky Back / Continue bar shared by every wizard step. */
export function StepFooter({
  onBack,
  submitLabel = 'Continue',
  loading,
  loadingText = 'Saving...',
  disabled,
  onSubmit,
}: Props) {
  return (
    <div className="safe-bottom sticky bottom-0 z-30 -mx-4 mt-8 flex gap-3 border-t border-line bg-surface px-4 py-3 md:static md:mx-0 md:border-0 md:bg-transparent md:px-0">
      {onBack && (
        <Button type="button" variant="outline" size="lg" onClick={onBack}>
          Back
        </Button>
      )}
      <Button
        type={onSubmit ? 'button' : 'submit'}
        onClick={onSubmit}
        block
        size="lg"
        loading={loading}
        loadingText={loadingText}
        disabled={disabled}
      >
        {submitLabel}
      </Button>
    </div>
  );
}
