'use client';

import { Camera, ImagePlus } from 'lucide-react';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { listingImagesApi } from '@/lib/api/endpoints/seller';
import { errorMessage } from '@/lib/api/errors';
import { canUseNativeCamera, pickNativePhotos } from '../photos/native-picker';
import { ImageTile } from '../photos/image-tile';
import { usePhotoUploads } from '../photos/use-photo-uploads';
import { StepFooter } from '../step-footer';
import type { StepProps } from '../step-props';

const MAX = 10;
const PROMPTS = ['Front', 'Rear', 'Side', 'Interior', 'Dashboard', 'Odometer', 'Engine'];

/** Step 5. 1–10 photos, uploaded straight to storage; first READY photo is the cover. */
export function PhotosStep({
  listing,
  next,
  back,
  refresh,
}: StepProps & { refresh: () => Promise<unknown> }) {
  const toast = useToast();
  const cameraInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string>();
  const { uploads, add, retry, discard } = usePhotoUploads(listing.id, refresh);

  const localIds = new Set(uploads.map((u) => u.imageId));
  const serverImages = listing.images.filter((image) => !localIds.has(image.id));
  const remaining = MAX - serverImages.length - uploads.length;
  const ready = serverImages.filter((image) => image.status === 'READY').length;

  const addFiles = (files: Blob[]) => {
    if (files.length > remaining)
      toast(`Only ${Math.max(remaining, 0)} more photos allowed`, 'info');
    void add(files.slice(0, Math.max(remaining, 0)));
  };
  const pick = async (source: 'camera' | 'gallery') => {
    if (!canUseNativeCamera())
      return (source === 'camera' ? cameraInput : galleryInput).current?.click();
    addFiles(await pickNativePhotos(source, remaining).catch(() => []));
  };
  const act = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
      await refresh();
    } catch (error) {
      toast(errorMessage(error), 'error');
    }
  };
  const reorder = (ids: string[]) => act(() => listingImagesApi.reorder(listing.id, ids));
  const ids = serverImages.map((image) => image.id);
  const move = (index: number, delta: -1 | 1) => {
    const order = [...listing.images.map((image) => image.id)];
    const from = order.indexOf(ids[index]);
    const to = order.indexOf(ids[index + delta]);
    [order[from], order[to]] = [order[to], order[from]];
    void reorder(order);
  };

  const proceed = () => {
    if (!ready) return setMessage('Add at least one photo to continue');
    if (uploads.length || serverImages.some((i) => i.status !== 'READY' && i.status !== 'FAILED')) {
      return setMessage('Wait for your photos to finish processing');
    }
    next();
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted">
        Add up to {MAX} photos. Suggested: {PROMPTS.join(', ')}.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="outline"
          size="lg"
          disabled={remaining <= 0}
          onClick={() => pick('camera')}
        >
          <Camera className="size-5" aria-hidden /> Take photo
        </Button>
        <Button
          variant="outline"
          size="lg"
          disabled={remaining <= 0}
          onClick={() => pick('gallery')}
        >
          <ImagePlus className="size-5" aria-hidden /> From gallery
        </Button>
      </div>
      <input
        ref={cameraInput}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={(e) => addFiles([...(e.target.files ?? [])])}
      />
      <input
        ref={galleryInput}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => addFiles([...(e.target.files ?? [])])}
      />

      <div
        className="hidden rounded-card border-2 border-dashed border-line-strong p-6 text-center text-sm text-muted md:block"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          addFiles([...e.dataTransfer.files].filter((f) => f.type.startsWith('image/')));
        }}
      >
        Drag and drop photos here
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {serverImages.map((image, index) => (
          <ImageTile
            key={image.id}
            index={index}
            src={image.urls?.thumb ?? null}
            status={image.status}
            failureReason={image.failureReason}
            isFirst={index === 0}
            isLast={index === serverImages.length - 1}
            onMove={(delta) => move(index, delta)}
            onMakeCover={() =>
              reorder([
                image.id,
                ...listing.images.map((i) => i.id).filter((id) => id !== image.id),
              ])
            }
            onRemove={() => act(() => listingImagesApi.remove(listing.id, image.id))}
          />
        ))}
        {uploads.map((upload, i) => (
          <ImageTile
            key={upload.key}
            index={serverImages.length + i}
            src={upload.previewUrl}
            status={upload.status === 'failed' ? 'FAILED' : 'UPLOADING'}
            progress={upload.progress}
            failureReason={upload.error}
            onRetry={() => retry(upload)}
            onRemove={() => discard(upload)}
          />
        ))}
      </div>

      {message && (
        <p role="alert" className="text-sm text-danger">
          {message}
        </p>
      )}
      <StepFooter onBack={back} onSubmit={proceed} />
    </div>
  );
}
