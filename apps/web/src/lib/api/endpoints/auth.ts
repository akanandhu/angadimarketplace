import { tokenStore } from '../../auth/token-store';
import { api } from '../client';
import type { Me, OtpRequestResult, VerifyOtpResult } from '../types';

export const authApi = {
  requestOtp: (phone: string) =>
    api<OtpRequestResult>('/auth/otp/request', {
      method: 'POST',
      body: { phone },
      anonymous: true,
    }),

  async verifyOtp(requestId: string, otp: string): Promise<VerifyOtpResult> {
    const result = await api<VerifyOtpResult>('/auth/otp/verify', {
      method: 'POST',
      anonymous: true,
      body: { requestId, otp, clientType: tokenStore.isNative() ? 'MOBILE' : 'WEB' },
    });
    await tokenStore.setRefresh(result.refreshToken);
    tokenStore.setAccess(result.accessToken);
    return result;
  },

  async logout() {
    const refreshToken = await tokenStore.getRefresh();
    await api('/auth/logout', { method: 'POST', body: { refreshToken }, anonymous: true }).catch(
      () => undefined,
    );
    await tokenStore.setRefresh(undefined);
    tokenStore.setAccess(null);
  },
};

export interface UpdateMeInput {
  name?: string;
  districtId?: string;
  accountType?: 'INDIVIDUAL' | 'DEALER';
  defaultAllowSellerContact?: boolean;
}

export const meApi = {
  get: () => api<Me>('/me'),
  update: (input: UpdateMeInput) => api<Me>('/me', { method: 'PATCH', body: input }),
  upsertDealerProfile: (input: { businessName: string; districtId?: string }) =>
    api('/me/dealer-profile', { method: 'PUT', body: input }),
};
