'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const PUBLIC_PREFIXES = ['/cars', '/car/', '/search', '/listing', '/dealer'];

/** Renders marketing chrome (footer) only on public discovery pages. */
export function PublicOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isPublic = pathname === '/' || PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  return isPublic ? <>{children}</> : null;
}
