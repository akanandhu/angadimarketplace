import { CookieOptions, Request, Response } from 'express';

export const REFRESH_COOKIE = 'angadi_refresh';

const options = (secure: boolean): CookieOptions => ({
  httpOnly: true,
  secure,
  sameSite: 'lax',
  path: '/api/v1/auth',
});

export function setRefreshCookie(res: Response, token: string, expiresAt: Date, secure: boolean) {
  res.cookie(REFRESH_COOKIE, token, { ...options(secure), expires: expiresAt });
}

export function clearRefreshCookie(res: Response, secure: boolean) {
  res.clearCookie(REFRESH_COOKIE, options(secure));
}

export function readRefreshToken(req: Request, bodyToken?: string): string | undefined {
  return bodyToken ?? (req.cookies?.[REFRESH_COOKIE] as string | undefined);
}
