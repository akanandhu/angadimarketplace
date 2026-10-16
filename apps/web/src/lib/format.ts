const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

/** ₹12,40,000 (Indian digit grouping). */
export const formatPrice = (value: number | null | undefined) =>
  value == null ? '—' : `₹${inr.format(value)}`;

/** ₹12.4 L / ₹1.2 Cr for compact chips. */
export function formatPriceShort(value: number): string {
  if (value >= 1_00_00_000) return `₹${trim(value / 1_00_00_000)} Cr`;
  if (value >= 1_00_000) return `₹${trim(value / 1_00_000)} L`;
  if (value >= 1000) return `₹${trim(value / 1000)}K`;
  return `₹${value}`;
}

const trim = (n: number) => (Math.round(n * 10) / 10).toString();

export const formatKm = (km: number) => `${inr.format(km)} km`;

export const formatNumber = (n: number) => inr.format(n);

const LABELS: Record<string, string> = {
  PETROL: 'Petrol',
  DIESEL: 'Diesel',
  CNG: 'CNG',
  ELECTRIC: 'Electric',
  MANUAL: 'Manual',
  AUTOMATIC: 'Automatic',
  NO: 'No accidents',
  MINOR: 'Minor accident',
  MAJOR: 'Major accident',
  COMPREHENSIVE: 'Comprehensive',
  THIRD_PARTY: 'Third party',
  EXPIRED: 'Expired',
};

export const label = (value: string | null | undefined) => (value ? (LABELS[value] ?? value) : '—');

export function ordinalOwner(owners: number): string {
  const suffix = owners === 1 ? 'st' : owners === 2 ? 'nd' : owners === 3 ? 'rd' : 'th';
  return `${owners}${suffix} owner`;
}

/** "3 days ago", "5 min ago", "just now". */
export function timeAgo(iso: string | null | undefined, now = Date.now()): string {
  if (!iso) return '';
  const seconds = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 1000));
  const units: [number, string][] = [
    [365 * 86400, 'year'],
    [30 * 86400, 'month'],
    [7 * 86400, 'week'],
    [86400, 'day'],
    [3600, 'hour'],
    [60, 'min'],
  ];
  for (const [size, name] of units) {
    const count = Math.floor(seconds / size);
    if (count >= 1) return `${count} ${name}${count > 1 && name !== 'min' ? 's' : ''} ago`;
  }
  return 'just now';
}

/** Whole days until a future date, rounded up ("in 2 days"). */
export function daysUntil(iso: string, now = Date.now()): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 86400000));
}

export function memberSince(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
}
