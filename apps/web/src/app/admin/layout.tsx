import type { Metadata } from 'next';
import { ReactNode } from 'react';
import { AdminShell } from '@/features/admin/admin-shell';

export const metadata: Metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
