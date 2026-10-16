'use client';

import { useCallback, useState } from 'react';
import { listingImagesApi, uploadToStorage } from '@/lib/api/endpoints/seller';
import { prepareImage } from './prepare-image';

export interface LocalUpload {
  key: string;
  previewUrl: string;
  progress: number;
  status: 'uploading' | 'failed';
  imageId?: string;
  file: File;
  error?: string;
}

const meta = (file: File) => ({ fileName: file.name, mimeType: file.type, sizeBytes: file.size });

/**
 * Direct-to-S3 uploads with progress. Once the API accepts `complete`, the image is
 * owned by the server listing (PROCESSING -> READY) and the local entry is dropped.
 */
export function usePhotoUploads(listingId: string, onServerChange: () => Promise<unknown>) {
  const [uploads, setUploads] = useState<LocalUpload[]>([]);
  const patch = (key: string, change: Partial<LocalUpload>) =>
    setUploads((list) => list.map((u) => (u.key === key ? { ...u, ...change } : u)));

  const run = useCallback(
    async (entry: LocalUpload) => {
      try {
        const presigned = entry.imageId
          ? await listingImagesApi.retry(listingId, entry.imageId, meta(entry.file))
          : await listingImagesApi.requestUpload(listingId, meta(entry.file));
        patch(entry.key, { imageId: presigned.imageId, status: 'uploading', error: undefined });
        await uploadToStorage(presigned.upload, entry.file, (p) =>
          patch(entry.key, { progress: p }),
        );
        await listingImagesApi.complete(listingId, presigned.imageId);
        await onServerChange();
        setUploads((list) => list.filter((u) => u.key !== entry.key));
        URL.revokeObjectURL(entry.previewUrl);
      } catch (error) {
        patch(entry.key, {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Upload failed',
        });
        await onServerChange();
      }
    },
    [listingId, onServerChange],
  );

  const add = useCallback(
    async (blobs: Blob[]) => {
      for (const blob of blobs) {
        const file = await prepareImage(blob, blob instanceof File ? blob.name : 'photo.jpg').catch(
          () => null,
        );
        if (!file) continue;
        const entry: LocalUpload = {
          key: crypto.randomUUID(),
          previewUrl: URL.createObjectURL(file),
          progress: 0,
          status: 'uploading',
          file,
        };
        setUploads((list) => [...list, entry]);
        void run(entry);
      }
    },
    [run],
  );

  const retry = (entry: LocalUpload) => {
    patch(entry.key, { status: 'uploading', progress: 0 });
    void run(entry);
  };

  const discard = (entry: LocalUpload) => {
    URL.revokeObjectURL(entry.previewUrl);
    setUploads((list) => list.filter((u) => u.key !== entry.key));
  };

  return { uploads, add, retry, discard };
}
