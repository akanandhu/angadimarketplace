'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { authApi } from '@/lib/api/endpoints/auth';
import { ApiError, errorMessage } from '@/lib/api/errors';
import type { OtpRequestResult, VerifyOtpResult } from '@/lib/api/types';

interface Props {
  phone: string;
  request: OtpRequestResult;
  onResent: (result: OtpRequestResult) => void;
  onVerified: (result: VerifyOtpResult) => void;
  onChangeNumber: () => void;
}

const MESSAGES: Record<string, string> = {
  OTP_INVALID: 'Incorrect OTP. Please check and try again.',
  OTP_EXPIRED: 'This OTP has expired. Request a new one.',
  OTP_TOO_MANY_ATTEMPTS: 'Too many incorrect attempts. Request a new OTP.',
};

export function OtpStep({ phone, request, onResent, onVerified, onChangeNumber }: Props) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [wait, setWait] = useState(request.resendAfterSeconds);

  useEffect(() => {
    setWait(request.resendAfterSeconds);
    const timer = setInterval(() => setWait((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [request]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) return setError('Enter the 6-digit OTP');
    setLoading(true);
    setError(undefined);
    try {
      onVerified(await authApi.verifyOtp(request.requestId, otp));
    } catch (err) {
      setError(err instanceof ApiError ? (MESSAGES[err.code] ?? err.message) : errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError(undefined);
    try {
      onResent(await authApi.requestOtp(`+91${phone}`));
      setOtp('');
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="text-sm text-muted">
        Enter the OTP sent to <span className="font-semibold text-ink">+91 {phone}</span>.{' '}
        <button type="button" onClick={onChangeNumber} className="font-semibold text-brand">
          Change
        </button>
      </p>
      <Field label="One-time password" htmlFor="login-otp" error={error}>
        <Input
          id="login-otp"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
          aria-invalid={Boolean(error)}
          className="text-center text-xl tracking-[0.5em]"
          autoFocus
        />
      </Field>
      <Button type="submit" block size="lg" loading={loading} loadingText="Verifying...">
        Verify & continue
      </Button>
      <p className="text-center text-sm text-muted">
        {wait > 0 ? (
          `Resend OTP in ${wait}s`
        ) : (
          <button type="button" onClick={resend} className="font-semibold text-brand">
            Resend OTP
          </button>
        )}
      </p>
    </form>
  );
}
