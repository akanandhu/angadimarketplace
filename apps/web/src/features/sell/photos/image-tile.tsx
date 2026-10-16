import { ArrowLeft, ArrowRight, Loader2, RotateCw, Star, Trash2 } from 'lucide-react';
import { ReactNode } from 'react';
import { Badge } from '@/components/ui/feedback';

interface Props {
  src: string | null;
  index: number;
  status: 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';
  progress?: number;
  failureReason?: string | null;
  onRemove: () => void;
  onRetry?: () => void;
  onMove?: (delta: -1 | 1) => void;
  onMakeCover?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="rounded-full bg-surface/95 p-1.5 text-ink shadow-card hover:bg-surface"
    >
      {children}
    </button>
  );
}

/** One photo in the uploader grid, with explicit status text (not colour alone). */
export function ImageTile(props: Props) {
  const { src, index, status } = props;
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-line/50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src && <img src={src} alt={`Photo ${index + 1}`} className="size-full object-cover" />}

      {status !== 'READY' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-ink/55 p-2 text-center text-xs font-semibold text-white">
          {status === 'FAILED' ? (
            <>
              <span>Upload failed</span>
              {props.failureReason && (
                <span className="font-normal opacity-80">{props.failureReason}</span>
              )}
              {props.onRetry && (
                <button
                  type="button"
                  onClick={props.onRetry}
                  className="mt-1 flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-ink"
                >
                  <RotateCw className="size-3" aria-hidden /> Retry
                </button>
              )}
            </>
          ) : (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden />
              {status === 'UPLOADING'
                ? `Uploading ${Math.round((props.progress ?? 0) * 100)}%`
                : 'Processing...'}
            </>
          )}
        </div>
      )}

      {index === 0 && status === 'READY' && (
        <span className="absolute top-2 left-2">
          <Badge tone="gold">Cover</Badge>
        </span>
      )}
      <div className="absolute top-2 right-2">
        <IconButton label={`Remove photo ${index + 1}`} onClick={props.onRemove}>
          <Trash2 className="size-4" />
        </IconButton>
      </div>
      {status === 'READY' && props.onMove && (
        <div className="absolute inset-x-2 bottom-2 flex justify-between">
          <div className="flex gap-1">
            {!props.isFirst && (
              <IconButton
                label={`Move photo ${index + 1} earlier`}
                onClick={() => props.onMove!(-1)}
              >
                <ArrowLeft className="size-4" />
              </IconButton>
            )}
            {!props.isLast && (
              <IconButton label={`Move photo ${index + 1} later`} onClick={() => props.onMove!(1)}>
                <ArrowRight className="size-4" />
              </IconButton>
            )}
          </div>
          {!props.isFirst && props.onMakeCover && (
            <IconButton label={`Make photo ${index + 1} the cover`} onClick={props.onMakeCover}>
              <Star className="size-4" />
            </IconButton>
          )}
        </div>
      )}
    </div>
  );
}
