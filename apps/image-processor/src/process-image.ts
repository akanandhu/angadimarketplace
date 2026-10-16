import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { config } from './config';
import { reportResult } from './report-result';
import { InvalidImageError, transformImage } from './transform';

const UUID = '[0-9a-f-]{36}';
/** listings/{listingId}/{imageId}/source.{ext} */
const LISTING_SOURCE = new RegExp(`^(listings/${UUID}/(${UUID}))/source\\.(jpg|png|webp)$`);
/** users/{userId}/{avatar|logo}/{imageId}/source.{ext} */
const USER_SOURCE = new RegExp(`^(users/${UUID}/(?:avatar|logo)/(${UUID}))/source\\.(jpg|png|webp)$`);

export type ImageOwner = 'listing' | 'user';

export function parseSourceKey(key: string) {
  const listing = LISTING_SOURCE.exec(key);
  if (listing) return { storageKey: listing[1], imageId: listing[2], owner: 'listing' as const };
  const user = USER_SOURCE.exec(key);
  if (user) return { storageKey: user[1], imageId: user[2], owner: 'user' as const };
  return null;
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
    await reportResult(parsed.owner, parsed.imageId, {
      status: 'READY',
      width: result.width,
      height: result.height,
    });
  } catch (error) {
    if (!(error instanceof InvalidImageError)) throw error;
    await reportResult(parsed.owner, parsed.imageId, { status: 'FAILED', failureReason: error.message });
  }
}
