'use client';

import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { DistrictSelect } from '@/features/catalogue/district-select';
import { meApi } from '@/lib/api/endpoints/auth';
import { errorMessage } from '@/lib/api/errors';
import type { Me } from '@/lib/api/types';

/** Collected once after first login so sellers and buyers have a visible identity. */
export function ProfileStep({ me, onDone }: { me: Me; onDone: (me: Me) => void }) {
  const [name, setName] = useState(me.name ?? '');
  const [districtId, setDistrictId] = useState(me.district?.id ?? '');
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (name.trim().length < 2) return setError('Enter your name');
    setLoading(true);
    try {
      onDone(await meApi.update({ name: name.trim(), districtId: districtId || undefined }));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <p className="text-sm text-muted">Tell us a little about you. Your phone stays private.</p>
      <Field label="Your name" htmlFor="profile-name" error={error}>
        <Input
          id="profile-name"
          autoComplete="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoFocus
        />
      </Field>
      <Field label="District" htmlFor="profile-district" optional>
        <DistrictSelect id="profile-district" value={districtId} onChange={setDistrictId} />
      </Field>
      <Button type="submit" block size="lg" loading={loading}>
        Continue
      </Button>
    </form>
  );
}
