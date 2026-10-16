import { Capacitor } from '@capacitor/core';

type Listener = (token: string | null) => void;

const REFRESH_KEY = 'angadi.refresh';
const SESSION_HINT_KEY = 'angadi.has-session';
let accessToken: string | null = null;
const listeners = new Set<Listener>();

/** Access tokens live only in memory. Refresh tokens: HTTP-only cookie (web) or secure storage (native). */
export const tokenStore = {
  get access() {
    return accessToken;
  },

  setAccess(token: string | null) {
    accessToken = token;
    this.setSessionHint(Boolean(token));
    listeners.forEach((listener) => listener(token));
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  isNative: () => Capacitor.isNativePlatform(),

  /**
   * Web-only hint (not a secret) that a refresh cookie may exist, so visitors who
   * never logged in skip the pointless refresh call.
   */
  mayHaveSession(): boolean {
    if (Capacitor.isNativePlatform()) return true;
    try {
      return localStorage.getItem(SESSION_HINT_KEY) === '1';
    } catch {
      return true;
    }
  },

  setSessionHint(present: boolean) {
    try {
      if (present) localStorage.setItem(SESSION_HINT_KEY, '1');
      else localStorage.removeItem(SESSION_HINT_KEY);
    } catch {
      // Storage unavailable (private mode); the refresh call is merely attempted.
    }
  },

  async getRefresh(): Promise<string | undefined> {
    if (!Capacitor.isNativePlatform()) return undefined;
    const { SecureStorage } = await import('@aparajita/capacitor-secure-storage');
    const value = await SecureStorage.get(REFRESH_KEY).catch(() => null);
    return typeof value === 'string' ? value : undefined;
  },

  async setRefresh(token: string | undefined) {
    if (!Capacitor.isNativePlatform()) return;
    const { SecureStorage } = await import('@aparajita/capacitor-secure-storage');
    if (token) await SecureStorage.set(REFRESH_KEY, token);
    else await SecureStorage.remove(REFRESH_KEY).catch(() => undefined);
  },
};
