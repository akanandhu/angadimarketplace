import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from 'crypto';

export const sha256 = (value: string) => createHash('sha256').update(value).digest('hex');

export const hmac = (secret: string, value: string) =>
  createHmac('sha256', secret).update(value).digest('hex');

export const randomToken = (bytes = 32) => randomBytes(bytes).toString('base64url');

export const randomDigits = (length: number) =>
  Array.from({ length }, () => randomInt(0, 10)).join('');

export function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
