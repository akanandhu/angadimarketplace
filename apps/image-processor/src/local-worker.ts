import { Worker } from 'bullmq';
import { config, createS3Client } from './config';
import { processSourceObject } from './process-image';

/** Local stand-in for S3 -> SQS -> Lambda: consumes jobs the API enqueues on upload completion. */
const s3 = createS3Client();
const url = new URL(config.redisUrl);

const worker = new Worker<{ sourceKey: string }>(
  'media-processing',
  async (job) => processSourceObject(s3, job.data.sourceKey),
  {
    connection: { host: url.hostname, port: Number(url.port || 6379) },
    concurrency: 4,
  },
);

worker.on('completed', (job) => console.log(`Processed ${job.data.sourceKey}`));
worker.on('failed', (job, error) => console.error(`Failed ${job?.data.sourceKey}:`, error.message));
console.log('Image processor worker listening on queue "media-processing"');
