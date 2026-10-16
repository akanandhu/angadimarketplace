import { tokenStore } from '../auth/token-store';
import { API_URL } from '../env';
import { ApiError } from './errors';
import type { Page, Session } from './types';

type Query = Record<string, string | number | boolean | string[] | undefined | null>;

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Query;
  /** Skip the access token (e.g. auth endpoints). */
  anonymous?: boolean;
}

export function buildQuery(query?: Query): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) params.set(key, value.join(','));
    } else params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : '';
}

async function send(path: string, options: RequestOptions, token: string | null) {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers['content-type'] = 'application/json';
  if (token && !options.anonymous) headers.authorization = `Bearer ${token}`;
  try {
    return await fetch(`${API_URL}${path}${buildQuery(options.query)}`, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: path.startsWith('/auth/') ? 'include' : 'same-origin',
    });
  } catch {
    throw ApiError.network();
  }
}

let refreshing: Promise<string | null> | null = null;

/** Single-flight refresh shared by every request that hits a 401. */
export function refreshSession(): Promise<string | null> {
  refreshing ??= (async () => {
    try {
      const refreshToken = await tokenStore.getRefresh();
      const res = await send('/auth/refresh', { method: 'POST', body: { refreshToken } }, null);
      if (!res.ok) throw new Error('refresh failed');
      const session = (await res.json()).data as Session;
      await tokenStore.setRefresh(session.refreshToken);
      tokenStore.setAccess(session.accessToken);
      return session.accessToken;
    } catch {
      tokenStore.setAccess(null);
      return null;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

async function request(path: string, options: RequestOptions = {}) {
  let res = await send(path, options, tokenStore.access);
  if (res.status === 401 && !options.anonymous && !path.startsWith('/auth/')) {
    const token = await refreshSession();
    if (token) res = await send(path, options, token);
  }
  if (res.status === 204) return null;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const error = body?.error ?? {};
    throw new ApiError(res.status, error.code ?? 'UNKNOWN', error.message ?? 'Request failed', error.details);
  }
  return body;
}

/** Returns the unwrapped `data` of a single-resource response. */
export async function api<T>(path: string, options?: RequestOptions): Promise<T> {
  const body = await request(path, options);
  return (body?.data ?? null) as T;
}

/** Returns `{ data, meta }` for paginated endpoints. */
export async function apiPage<T>(path: string, query?: Query): Promise<Page<T>> {
  return (await request(path, { query })) as Page<T>;
}
