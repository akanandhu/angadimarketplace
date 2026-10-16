/** Isolated database and Redis DB for e2e runs; loaded before the app modules. */
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? 'postgresql://angadi:angadi@localhost:5433/angadi_test';
process.env.REDIS_URL = process.env.TEST_REDIS_URL ?? 'redis://localhost:6380/1';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.OTP_HASH_SECRET = 'test-otp-secret';
process.env.INTERNAL_API_SECRET = 'test-internal-secret';
process.env.MEDIA_LOCAL_PROCESSING = 'false';
process.env.S3_ENDPOINT = 'http://localhost:9000';
process.env.S3_ACCESS_KEY_ID = 'angadi';
process.env.S3_SECRET_ACCESS_KEY = 'angadi-secret';
process.env.POSTHOG_API_KEY = '';
process.env.FIREBASE_SERVICE_ACCOUNT_JSON = '';
