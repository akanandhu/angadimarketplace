import 'dotenv/config';
import { S3Client } from '@aws-sdk/client-s3';

const env = (key: string, fallback = '') => process.env[key] ?? fallback;

export const config = {
  region: env('AWS_REGION', 'ap-south-1'),
  bucket: env('S3_BUCKET', 'angadi-media-dev'),
  endpoint: env('S3_ENDPOINT'),
  accessKeyId: env('S3_ACCESS_KEY_ID'),
  secretAccessKey: env('S3_SECRET_ACCESS_KEY'),
  redisUrl: env('REDIS_URL', 'redis://localhost:6380'),
  apiInternalUrl: env('API_INTERNAL_URL', 'http://localhost:4000/api/v1/internal'),
  internalSecret: env('INTERNAL_API_SECRET'),
};

export function createS3Client(): S3Client {
  return new S3Client({
    region: config.region,
    ...(config.endpoint ? { endpoint: config.endpoint, forcePathStyle: true } : {}),
    ...(config.accessKeyId
      ? {
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          },
        }
      : {}),
  });
}
