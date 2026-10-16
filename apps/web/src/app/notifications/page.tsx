'use client';

import { AuthGate } from '@/features/auth/auth-gate';
import { NotificationsScreen } from '@/features/notifications/notifications-screen';

export default function NotificationsPage() {
  return <AuthGate title="Log in to see notifications">{() => <NotificationsScreen />}</AuthGate>;
}
