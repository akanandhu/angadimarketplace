import { api, apiPage } from '../client';
import type { ListingStatus } from '../types';

export interface AdminListingRow {
  id: string;
  title: string | null;
  slug: string | null;
  status: ListingStatus;
  price: number | null;
  district: string | null;
  seller: { id: string; name: string | null; phone: string; status: string; accountType: string };
  openReports: number;
  removedByAdmin: boolean;
  publishedAt: string | null;
}

export interface AdminUserRow {
  id: string;
  name: string | null;
  phone: string;
  accountType: string;
  role: string;
  status: 'ACTIVE' | 'SUSPENDED';
  district: string | null;
  dealer: { businessName: string; slug: string } | null;
  listingCount: number;
  suspensionReason: string | null;
  memberSince: string;
}

export interface AdminReportRow {
  id: string;
  reason: string;
  details: string | null;
  status: 'OPEN' | 'RESOLVED' | 'DISMISSED';
  listing: { id: string; title: string | null; slug: string | null; status: ListingStatus };
  reporter: { id: string; name: string | null; phone: string };
  resolutionNote: string | null;
  createdAt: string;
}

type Query = Record<string, string | number | undefined>;

export const adminApi = {
  overview: () =>
    api<{ activeListings: number; openReports: number; users: number; suspendedUsers: number }>(
      '/admin/overview',
    ),
  listings: (query: Query) => apiPage<AdminListingRow>('/admin/listings', query),
  removeListing: (id: string, note?: string) =>
    api(`/admin/listings/${id}/remove`, { method: 'POST', body: { note } }),
  restoreListing: (id: string) => api(`/admin/listings/${id}/restore`, { method: 'POST' }),
  users: (query: Query) => apiPage<AdminUserRow>('/admin/users', query),
  suspend: (id: string, note?: string) =>
    api(`/admin/users/${id}/suspend`, { method: 'POST', body: { note } }),
  unsuspend: (id: string) => api(`/admin/users/${id}/unsuspend`, { method: 'POST' }),
  reports: (query: Query) => apiPage<AdminReportRow>('/admin/reports', query),
  resolve: (id: string, note?: string) =>
    api(`/admin/reports/${id}/resolve`, { method: 'POST', body: { note } }),
  dismiss: (id: string, note?: string) =>
    api(`/admin/reports/${id}/dismiss`, { method: 'POST', body: { note } }),
};
