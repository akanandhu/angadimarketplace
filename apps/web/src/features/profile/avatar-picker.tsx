'use client';

import { Camera, Loader2, User } from 'lucide-react';
import { useRef } from 'react';
import { useUserImageUpload } from './use-user-image-upload';

interface Props {
  kind: 'avatar' | 'logo';
  url: string | null;
  label: string;
}

/** Round image with a change button; uploads through the processing pipeline. */
export function AvatarPicker({ kind, url, label }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const { upload, uploading, error } = useUserImageUpload(kind);
  return (
    <div className="flex items-center gap-4">
      <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-gold-soft text-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url ? (
          <img src={url} alt="" className="size-full object-cover" />
        ) : (
          <User className="m-auto mt-6 size-8" aria-hidden />
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink/50 text-white">
            <Loader2 className="size-5 animate-spin" aria-label="Uploading" />
          </div>
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-sm font-semibold text-brand"
        >
          <Camera className="size-4" aria-hidden /> {url ? `Change ${label}` : `Add ${label}`}
        </button>
        {error && (
          <p role="alert" className="mt-1 text-sm text-danger">
            {error}
          </p>
        )}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
      />
    </div>
  );
}
