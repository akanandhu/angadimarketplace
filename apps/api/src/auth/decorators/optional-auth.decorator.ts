import { SetMetadata } from '@nestjs/common';

export const OPTIONAL_AUTH_KEY = 'optionalAuth';

/** Public route that still resolves the user when a valid token is sent. */
export const OptionalAuth = () => SetMetadata(OPTIONAL_AUTH_KEY, true);
