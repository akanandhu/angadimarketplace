const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 15 * 1024 * 1024;
const MAX_EDGE = 2560;

/**
 * Ensures the upload is a JPEG/PNG/WebP under 15 MB. Anything else (e.g. HEIC that the
 * browser can decode) is re-encoded to JPEG and downscaled. Server-side processing still
 * validates the real content.
 */
export async function prepareImage(file: Blob, name = 'photo.jpg'): Promise<File> {
  if (ACCEPTED.includes(file.type) && file.size <= MAX_BYTES) {
    return file instanceof File ? file : new File([file], name, { type: file.type });
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Could not read this photo'))),
      'image/jpeg',
      0.88,
    ),
  );
  return new File([blob], name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}
