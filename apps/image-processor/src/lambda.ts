import type { S3Event, SQSBatchResponse, SQSEvent } from 'aws-lambda';
import { createS3Client } from './config';
import { processSourceObject } from './process-image';

const s3 = createS3Client();

/** SQS-triggered handler for S3 ObjectCreated notifications. Reports partial batch failures. */
export async function handler(event: SQSEvent): Promise<SQSBatchResponse> {
  const failures: SQSBatchResponse['batchItemFailures'] = [];

  for (const message of event.Records) {
    try {
      const notification = JSON.parse(message.body) as Partial<S3Event>;
      for (const record of notification.Records ?? []) {
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
        await processSourceObject(s3, key);
      }
    } catch (error) {
      console.error(`Failed to process message ${message.messageId}`, error);
      failures.push({ itemIdentifier: message.messageId });
    }
  }
  return { batchItemFailures: failures };
}
