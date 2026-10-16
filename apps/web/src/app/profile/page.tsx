'use client';

import { AuthGate } from '@/features/auth/auth-gate';
import { ProfileScreen } from '@/features/profile/profile-screen';

export default function ProfilePage() {
  return <AuthGate title="Log in to see your profile">{(me) => <ProfileScreen me={me} />}</AuthGate>;
}
