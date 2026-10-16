import {
  DeleteObjectsCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { AppConfig } from '../../config/app-config.service';

const UPLOAD_URL_TTL_SECONDS = 15 * 60;

export interface PresignedUpload {
  method: 'PUT';
  url: string;
  headers: Record<string, string>;
  expiresAt: string;
}

/** Thin S3 wrapper. Image bytes go client -> S3 directly; they never pass through the API. */
@Injectable()
export class ObjectStorageService {
  private readonly s3: S3Client;
  private readonly bucket: string;

  constructor(config: AppConfig) {
    const endpoint = config.get('S3_ENDPOINT');
    const accessKeyId = config.get('S3_ACCESS_KEY_ID');
    this.bucket = config.get('S3_BUCKET');
    this.s3 = new S3Client({
      region: config.get('AWS_REGION'),
      ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
      ...(accessKeyId
        ? {
            credentials: {
              accessKeyId,
              secretAccessKey: config.get('S3_SECRET_ACCESS_KEY'),
            },
          }
        : {}),
    });
  }

  /** Presigned PUT whose signature pins both content type and exact size. */
  async presignUpload(key: string, mimeType: string, sizeBytes: number): Promise<PresignedUpload> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: mimeType,
      ContentLength: sizeBytes,
    });
    const url = await getSignedUrl(this.s3, command, {
      expiresIn: UPLOAD_URL_TTL_SECONDS,
      signableHeaders: new Set(['content-type', 'content-length']),
    });
    return {
      method: 'PUT',
      url,
      headers: { 'Content-Type': mimeType },
      expiresAt: new Date(Date.now() + UPLOAD_URL_TTL_SECONDS * 1000).toISOString(),
    };
  }

  /** Returns the stored object size, or null when it does not exist. */
  async sizeOf(key: string): Promise<number | null> {
    try {
      const head = await this.s3.send(new HeadObjectCommand({ Bucket: this.bucket, Key: key }));
      return head.ContentLength ?? 0;
    } catch {
      return null;
    }
  }

  async deletePrefix(prefix: string): Promise<number> {
    let deleted = 0;
    let token: string | undefined;
    do {
      const page = await this.s3.send(
        new ListObjectsV2Command({ Bucket: this.bucket, Prefix: prefix, ContinuationToken: token }),
      );
      const keys = (page.Contents ?? []).map((object) => ({ Key: object.Key! }));
      if (keys.length) {
        await this.s3.send(
          new DeleteObjectsCommand({ Bucket: this.bucket, Delete: { Objects: keys } }),
        );
        deleted += keys.length;
      }
      token = page.NextContinuationToken;
    } while (token);
    return deleted;
  }
}
