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
  CDN_BASE_URL: string;
  FIREBASE_SERVICE_ACCOUNT_JSON: string;
}

const REQUIRED = ['DATABASE_URL', 'REDIS_URL', 'JWT_ACCESS_SECRET', 'OTP_HASH_SECRET'] as const;

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
    CDN_BASE_URL: str('CDN_BASE_URL', 'http://localhost:4000/media'),
    FIREBASE_SERVICE_ACCOUNT_JSON: str('FIREBASE_SERVICE_ACCOUNT_JSON'),
  };
}
