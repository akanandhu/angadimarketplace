'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { uploadToStorage, userImagesApi } from '@/lib/api/endpoints/seller';
import { keys } from '@/lib/query/keys';
import { prepareImage } from '../sell/photos/prepare-image';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Uploads a profile photo or dealer logo, then waits for processing before refreshing /me. */
export function useUserImageUpload(kind: 'avatar' | 'logo') {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>();

  const upload = async (blob: Blob) => {
    setUploading(true);
    setError(undefined);
    try {
      const file = await prepareImage(blob, 'image.jpg');
      const meta = { fileName: file.name, mimeType: file.type, sizeBytes: file.size };
      const presigned = await (kind === 'avatar'
        ? userImagesApi.requestProfile(meta)
        : userImagesApi.requestLogo(meta));
      await uploadToStorage(presigned.upload, file);
      await userImagesApi.complete(presigned.imageId);
      for (let attempt = 0; attempt < 30; attempt++) {
        const status = await userImagesApi.status(presigned.imageId);
        if (status.status === 'READY') break;
        if (status.status === 'FAILED')
          throw new Error(status.failureReason ?? 'Image could not be processed');
        await sleep(1000);
      }
      await queryClient.invalidateQueries({ queryKey: keys.me });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return { upload, uploading, error };
}
