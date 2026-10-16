export const Queues = {
  /** Dev-only: mirrors the S3 -> SQS -> Lambda pipeline. Consumed by apps/image-processor. */
  MEDIA_PROCESSING: 'media-processing',
  MEDIA_CLEANUP: 'media-cleanup',
  PUSH_NOTIFICATIONS: 'push-notifications',
  LISTING_VIEWS: 'listing-views',
} as const;
