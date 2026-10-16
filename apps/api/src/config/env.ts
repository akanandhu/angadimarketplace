export interface Env {
  NODE_ENV: string;
  PORT: number;
  WEB_ORIGIN: string;
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_ACCESS_TTL_SECONDS: number;
  REFRESH_TTL_DAYS: number;
  OTP_HASH_SECRET: string;
  SMS_PROVIDER: 'console' | 'msg91';
  AWS_REGION: string;
  S3_BUCKET: string;
  S3_ENDPOINT: string;
  S3_ACCESS_KEY_ID: string;
  S3_SECRET_ACCESS_KEY: string;
  CDN_BASE_URL: string;
  /** Dev only: process uploads through a BullMQ worker instead of S3 -> SQS -> Lambda. */
  MEDIA_LOCAL_PROCESSING: boolean;
  INTERNAL_API_SECRET: string;
  FIREBASE_SERVICE_ACCOUNT_JSON: string;
  POSTHOG_API_KEY: string;
  POSTHOG_HOST: string;
}

const REQUIRED = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_ACCESS_SECRET',
  'OTP_HASH_SECRET',
  'INTERNAL_API_SECRET',
] as const;

export function validateEnv(raw: Record<string, unknown>): Env {
  const missing = REQUIRED.filter((key) => !raw[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  const str = (key: string, fallback = '') => String(raw[key] ?? fallback);
  const num = (key: string, fallback: number) => Number(raw[key] ?? fallback);

  return {
    NODE_ENV: str('NODE_ENV', 'development'),
    PORT: num('PORT', 4000),
    WEB_ORIGIN: str('WEB_ORIGIN', 'http://localhost:3000'),
    DATABASE_URL: str('DATABASE_URL'),
    REDIS_URL: str('REDIS_URL'),
    JWT_ACCESS_SECRET: str('JWT_ACCESS_SECRET'),
    JWT_ACCESS_TTL_SECONDS: num('JWT_ACCESS_TTL_SECONDS', 900),
    REFRESH_TTL_DAYS: num('REFRESH_TTL_DAYS', 30),
    OTP_HASH_SECRET: str('OTP_HASH_SECRET'),
    SMS_PROVIDER: str('SMS_PROVIDER', 'console') === 'msg91' ? 'msg91' : 'console',
    AWS_REGION: str('AWS_REGION', 'ap-south-1'),
    S3_BUCKET: str('S3_BUCKET', 'angadi-media-dev'),
    S3_ENDPOINT: str('S3_ENDPOINT'),
    S3_ACCESS_KEY_ID: str('S3_ACCESS_KEY_ID'),
    S3_SECRET_ACCESS_KEY: str('S3_SECRET_ACCESS_KEY'),
    CDN_BASE_URL: str('CDN_BASE_URL', 'http://localhost:9000/angadi-media-dev'),
    MEDIA_LOCAL_PROCESSING: str('MEDIA_LOCAL_PROCESSING') === 'true',
    INTERNAL_API_SECRET: str('INTERNAL_API_SECRET'),
    FIREBASE_SERVICE_ACCOUNT_JSON: str('FIREBASE_SERVICE_ACCOUNT_JSON'),
    POSTHOG_API_KEY: str('POSTHOG_API_KEY'),
    POSTHOG_HOST: str('POSTHOG_HOST', 'https://eu.i.posthog.com'),
  };
}
