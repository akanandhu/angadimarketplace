import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Mobile shell around the static export (`pnpm build:mobile` -> out/).
 * There is no Next.js server on device; screens fetch from the API directly.
 */
const config: CapacitorConfig = {
  appId: 'com.angadimarketplace.app',
  appName: 'Angadi',
  webDir: 'out',
  server: { androidScheme: 'https' },
  plugins: {
    PushNotifications: { presentationOptions: ['badge', 'sound', 'alert'] },
  },
};

export default config;
