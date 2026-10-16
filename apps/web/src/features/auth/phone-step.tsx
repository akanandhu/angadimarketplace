'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { authApi } from '@/lib/api/endpoints/auth';
import { errorMessage } from '@/lib/api/errors';
import type { OtpRequestResult } from '@/lib/api/types';

interface Props {
  onSent: (phone: string, result: OtpRequestResult) => void;
}

export function PhoneStep({ onSent }: Props) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const digits = phone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(digits)) return setError('Enter a valid 10-digit mobile number');
    setLoading(true);
    setError(undefined);
    try {
      onSent(digits, await authApi.requestOtp(`+91${digits}`));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="text-sm text-muted">
        We&apos;ll send a one-time password to verify your number. Your number stays private.
      </p>
      <Field label="Mobile number" htmlFor="login-phone" error={error}>
        <div className="flex">
          <span className="flex items-center rounded-l-input border border-r-0 border-line-strong bg-canvas px-3 text-sm text-muted">
            +91
          </span>
          <Input
            id="login-phone"
            inputMode="numeric"
            autoComplete="tel-national"
            placeholder="98765 43210"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            aria-invalid={Boolean(error)}
            className="rounded-l-none"
            autoFocus
          />
        </div>
      </Field>
      <Button type="submit" block size="lg" loading={loading} loadingText="Sending OTP...">
        Send OTP
      </Button>
    </form>
  );
}
