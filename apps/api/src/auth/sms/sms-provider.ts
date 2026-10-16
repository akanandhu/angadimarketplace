export const SMS_PROVIDER = Symbol('SMS_PROVIDER');

/** Delivery abstraction so the SMS vendor can change without touching auth. */
export interface SmsProvider {
  sendOtp(phone: string, otp: string): Promise<void>;
}
