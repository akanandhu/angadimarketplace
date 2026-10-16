import { config } from './config';
import type { ImageOwner } from './process-image';

export interface ProcessingResult {
  status: 'READY' | 'FAILED';
  width?: number;
  height?: number;
  failureReason?: string;
}

/** Hands the outcome back to the API, which owns the database. */
export async function reportResult(
  owner: ImageOwner,
  imageId: string,
  result: ProcessingResult,
): Promise<void> {
  const path = owner === 'listing' ? 'images' : 'user-images';
  const response = await fetch(`${config.apiInternalUrl}/media/${path}/${imageId}/result`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-internal-secret': config.internalSecret },
    body: JSON.stringify(result),
  });
  if (!response.ok) {
    throw new Error(`Result callback failed for ${imageId}: ${response.status}`);
  }
}
