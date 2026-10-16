import sharp, { Metadata } from 'sharp';

export const VARIANTS = [
  { name: 'thumb', width: 300 },
  { name: 'card', width: 700 },
  { name: 'detail', width: 1400 },
] as const;

const ACCEPTED_FORMATS = new Set(['jpeg', 'png', 'webp']);
const MAX_PIXELS = 50_000_000;

export class InvalidImageError extends Error {}

export interface TransformedImage {
  width: number;
  height: number;
  variants: { name: string; body: Buffer }[];
}

/**
 * Validates the real file content (not the declared MIME), applies EXIF orientation,
 * drops metadata (sharp strips it unless asked to keep it) and renders WebP variants.
 */
export async function transformImage(source: Buffer): Promise<TransformedImage> {
  let metadata: Metadata;
  try {
    metadata = await sharp(source).metadata();
  } catch {
    throw new InvalidImageError('File is not a readable image');
  }
  if (!metadata.format || !ACCEPTED_FORMATS.has(metadata.format)) {
    throw new InvalidImageError(`Unsupported image format: ${metadata.format ?? 'unknown'}`);
  }
  if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_PIXELS) {
    throw new InvalidImageError('Image dimensions are not supported');
  }

  const oriented = await sharp(source).rotate().toBuffer({ resolveWithObject: true });
  const variants = await Promise.all(
    VARIANTS.map(async ({ name, width }) => ({
      name,
      body: await sharp(oriented.data)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer(),
    })),
  );
  return { width: oriented.info.width, height: oriented.info.height, variants };
}
