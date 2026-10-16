import { UserRole } from '../generated/prisma/client';

/** Identity attached to authenticated requests. */
export interface AuthUser {
  id: string;
  role: UserRole;
  sessionId: string;
}

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  sid: string;
}
