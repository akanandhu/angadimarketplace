export const MAX_IMAGE_BYTES = 15 * 1024 * 1024;

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

export const ALLOWED_IMAGE_TYPES = Object.keys(EXTENSIONS);

export function imageExtension(mimeType: string): string | null {
  return EXTENSIONS[mimeType] ?? null;
}

/** listings/{listingId}/{imageId} — variants live beneath this logical prefix. */
export function imageStorageKey(listingId: string, imageId: string): string {
  return `listings/${listingId}/${imageId}`;
}

/** Private original retained for reprocessing. */
export function sourceObjectKey(storageKey: string, mimeType: string): string {
  return `${storageKey}/source.${imageExtension(mimeType)}`;
}
