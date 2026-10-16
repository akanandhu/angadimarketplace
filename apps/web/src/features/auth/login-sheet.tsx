'use client';

import { useState } from 'react';
import { Sheet } from '@/components/ui/sheet';
import type { Me, OtpRequestResult } from '@/lib/api/types';
import { OtpStep } from './otp-step';
import { PhoneStep } from './phone-step';
import { ProfileStep } from './profile-step';

type Step =
  | { name: 'phone' }
  | { name: 'otp'; phone: string; request: OtpRequestResult }
  | { name: 'profile'; me: Me };

const TITLES = {
  phone: 'Log in or sign up',
  otp: 'Verify your number',
  profile: 'Complete your profile',
};

interface Props {
  open: boolean;
  onClose: () => void;
  onLoggedIn: (me: Me) => void;
}

/** Phone -> OTP -> (first time) name & district. Resumes the action that required login. */
export function LoginSheet({ open, onClose, onLoggedIn }: Props) {
  const [step, setStep] = useState<Step>({ name: 'phone' });

  const finish = (me: Me) => {
    setStep({ name: 'phone' });
    onLoggedIn(me);
  };

  return (
    <Sheet open={open} onClose={onClose} title={TITLES[step.name]}>
      {step.name === 'phone' && (
        <PhoneStep onSent={(phone, request) => setStep({ name: 'otp', phone, request })} />
      )}
      {step.name === 'otp' && (
        <OtpStep
          phone={step.phone}
          request={step.request}
          onResent={(request) => setStep({ ...step, request })}
          onChangeNumber={() => setStep({ name: 'phone' })}
          onVerified={(result) =>
            result.user.name ? finish(result.user) : setStep({ name: 'profile', me: result.user })
          }
        />
      )}
      {step.name === 'profile' && <ProfileStep me={step.me} onDone={finish} />}
    </Sheet>
  );
}
