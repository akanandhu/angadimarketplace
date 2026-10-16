import { ContactRequest } from '../generated/prisma/client';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';

export const requestNotFound = () =>
  AppException.notFound(ErrorCode.CONTACT_REQUEST_NOT_FOUND, 'Contact request not found');

/** Explains why a guarded PENDING -> X transition did not apply. */
export function transitionError(
  request: ContactRequest | null,
  actorId: string,
  actor: 'buyer' | 'seller',
): AppException {
  if (!request) return requestNotFound();
  const ownerId = actor === 'buyer' ? request.buyerId : request.sellerId;
  if (ownerId !== actorId) {
    return AppException.forbidden(
      ErrorCode.CONTACT_REQUEST_NOT_OWNER,
      'You cannot act on this request',
    );
  }
  return AppException.conflict(
    ErrorCode.CONTACT_REQUEST_NOT_PENDING,
    'This request has already been answered',
    { status: request.status },
  );
}
