import { Capacitor } from '@capacitor/core';

type Listener = (token: string | null) => void;

const REFRESH_KEY = 'angadi.refresh';
let accessToken: string | null = null;
const listeners = new Set<Listener>();

/** Access tokens live only in memory. Refresh tokens: HTTP-only cookie (web) or secure storage (native). */
export const tokenStore = {
  get access() {
    return accessToken;
  },

  setAccess(token: string | null) {
    accessToken = token;
    listeners.forEach((listener) => listener(token));
  },

  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  isNative: () => Capacitor.isNativePlatform(),

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
