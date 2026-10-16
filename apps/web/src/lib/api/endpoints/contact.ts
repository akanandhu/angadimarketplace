import { api, apiPage } from '../client';
import type {
  AppNotification,
  ContactRequestStatus,
  ContactState,
  IncomingRequest,
  OutgoingRequest,
  RejectionReason,
} from '../types';

export const contactApi = {
  request: (listingId: string, allowSellerToContact: boolean) =>
    api<{ id: string; status: string }>('/contact-requests', {
      method: 'POST',
      body: { listingId, allowSellerToContact },
    }),
  approve: (id: string) => api(`/contact-requests/${id}/approve`, { method: 'POST' }),
  reject: (id: string, reason: RejectionReason, note?: string) =>
    api(`/contact-requests/${id}/reject`, { method: 'POST', body: { reason, note } }),
  cancel: (id: string) => api(`/contact-requests/${id}/cancel`, { method: 'POST' }),
  incoming: (status: ContactRequestStatus, page = 1) =>
    apiPage<IncomingRequest>('/me/contact-requests/incoming', { status, page }),
  outgoing: (status: ContactRequestStatus, page = 1) =>
    apiPage<OutgoingRequest>('/me/contact-requests/outgoing', { status, page }),
  state: (sellerId: string, listingId?: string) =>
    api<ContactState>(`/me/contact-state/sellers/${sellerId}`, { query: { listingId } }),
};

export const notificationsApi = {
  list: (page = 1) => apiPage<AppNotification>('/me/notifications', { page }),
  unreadCount: () => api<{ count: number }>('/me/notifications/unread-count'),
  markRead: (id: string) => api(`/me/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => api('/me/notifications/read-all', { method: 'POST' }),
  registerDevice: (platform: string, deviceIdentifier: string, pushToken: string) =>
    api('/me/devices', { method: 'POST', body: { platform, deviceIdentifier, pushToken } }),
};
