'use client';

import { Capacitor } from '@capacitor/core';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { notificationsApi } from '@/lib/api/endpoints/contact';
import { routes } from '@/lib/routes';

const DEVICE_KEY = 'angadi.device-id';

function deviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

/** Maps a shared web URL (angadimarketplace.com/car/<slug>) onto the app's screens. */
function appPathFor(url: string): string | null {
  const { pathname, search } = new URL(url);
  const listing = /^\/car\/([^/]+)/.exec(pathname);
  if (listing) return routes.listing(listing[1]);
  const dealer = /^\/dealers\/([^/]+)/.exec(pathname);
  if (dealer) return routes.dealer(dealer[1]);
  if (pathname.startsWith('/cars')) return `/search${search}`;
  return pathname + search;
}

/** Native-only wiring: push registration, notification taps, back button, deep links. */
export function NativeBridge() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { status } = useAuth();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    let cleanup: (() => void) | undefined;
    void (async () => {
      const { App } = await import('@capacitor/app');
      const back = await App.addListener('backButton', ({ canGoBack }) =>
        canGoBack ? window.history.back() : App.exitApp(),
      );
      const link = await App.addListener('appUrlOpen', ({ url }) => {
        const path = appPathFor(url);
        if (path) router.push(path);
      });
      cleanup = () => {
        void back.remove();
        void link.remove();
      };
    })();
    return () => cleanup?.();
  }, [router]);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || status !== 'authenticated') return;
    let cleanup: (() => void) | undefined;
    void (async () => {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive !== 'granted') return;
      const registered = await PushNotifications.addListener('registration', ({ value }) => {
        const platform = Capacitor.getPlatform() === 'ios' ? 'IOS' : 'ANDROID';
        void notificationsApi.registerDevice(platform, deviceId(), value).catch(() => undefined);
      });
      const received = await PushNotifications.addListener('pushNotificationReceived', () =>
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      );
      const tapped = await PushNotifications.addListener(
        'pushNotificationActionPerformed',
        ({ notification }) => {
          const type = String(notification.data?.type ?? '');
          router.push(
            type === 'CONTACT_REQUEST_RECEIVED'
              ? routes.requests('received')
              : type.startsWith('CONTACT_REQUEST_')
                ? routes.requests('sent')
                : routes.notifications(),
          );
        },
      );
      await PushNotifications.register();
      cleanup = () => {
        void registered.remove();
        void received.remove();
        void tapped.remove();
      };
    })();
    return () => cleanup?.();
  }, [status, router, queryClient]);

  return null;
}
