import { CancellationSource, ContactRequestStatus } from '../../generated/prisma/client';

export const COOLDOWN_DAYS = 4;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface ClosedRequestLike {
  status: ContactRequestStatus;
  respondedAt: Date | null;
  cancelledAt: Date | null;
  cancellationSource: CancellationSource | null;
}

/**
 * When the buyer may request contact again for the same buyer + seller + listing.
 * Rejections and buyer cancellations start a 4-day cooldown; system cancellations
 * (made redundant by an approval) do not.
 */
export function canRequestAgainAt(request: ClosedRequestLike): Date | null {
  if (request.status === 'REJECTED' && request.respondedAt) {
    return new Date(request.respondedAt.getTime() + COOLDOWN_DAYS * DAY_MS);
  }
  if (
    request.status === 'CANCELLED' &&
    request.cancellationSource === 'BUYER' &&
    request.cancelledAt
  ) {
    return new Date(request.cancelledAt.getTime() + COOLDOWN_DAYS * DAY_MS);
  }
  return null;
}

/** The cooldown end if it is still in the future, otherwise null. */
export function activeCooldownUntil(request: ClosedRequestLike | null, now = new Date()) {
  if (!request) return null;
  const until = canRequestAgainAt(request);
  return until && until > now ? until : null;
}
