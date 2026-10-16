import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { config } from './config';
import { reportResult } from './report-result';
import { InvalidImageError, transformImage } from './transform';

/** listings/{listingId}/{imageId}/source.{ext} */
const SOURCE_KEY = /^(listings\/[0-9a-f-]{36}\/([0-9a-f-]{36}))\/source\.(jpg|png|webp)$/;

export function parseSourceKey(key: string) {
  const match = SOURCE_KEY.exec(key);
  return match ? { storageKey: match[1], imageId: match[2] } : null;
}

/**
 * Processes one uploaded source object. Invalid images are reported as FAILED;
 * infrastructure errors are rethrown so the queue can retry.
 */
export async function processSourceObject(s3: S3Client, sourceKey: string): Promise<void> {
  const parsed = parseSourceKey(sourceKey);
  if (!parsed) return; // Not a source upload (e.g. our own variant writes).

  const object = await s3.send(new GetObjectCommand({ Bucket: config.bucket, Key: sourceKey }));
  const source = Buffer.from(await object.Body!.transformToByteArray());

  try {
    const result = await transformImage(source);
    await Promise.all(
      result.variants.map((variant) =>
        s3.send(
          new PutObjectCommand({
            Bucket: config.bucket,
            Key: `${parsed.storageKey}/${variant.name}.webp`,
            Body: variant.body,
            ContentType: 'image/webp',
            CacheControl: 'public, max-age=31536000, immutable',
          }),
        ),
      ),
    );
    await reportResult(parsed.imageId, {
      status: 'READY',
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    if (!(error instanceof InvalidImageError)) throw error;
    await reportResult(parsed.imageId, { status: 'FAILED', failureReason: error.message });
  }
}
