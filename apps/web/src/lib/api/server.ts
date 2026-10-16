import 'server-only';
import { buildQuery } from './client';
import { SERVER_API_URL } from '../env';

export interface ServerResult<T> {
  status: number;
  body: { data?: T; meta?: unknown; error?: { code: string; details: unknown } } | null;
}

/** Anonymous SSR fetch for public SEO pages (web build only). Cached briefly. */
export async function serverGet<T>(
  path: string,
  query?: Parameters<typeof buildQuery>[0],
  revalidate = 60,
): Promise<ServerResult<T>> {
  try {
    const res = await fetch(`${SERVER_API_URL}${path}${buildQuery(query)}`, {
      next: { revalidate },
    });
    return { status: res.status, body: await res.json().catch(() => null) };
  } catch {
    return { status: 503, body: null };
  }
}
