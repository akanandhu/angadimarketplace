'use client';

import { useQueryClient } from '@tanstack/react-query';
import { BadgeCheck } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { useToast } from '@/components/ui/toast';
import { DistrictSelect } from '@/features/catalogue/district-select';
import { meApi } from '@/lib/api/endpoints/auth';
import { errorMessage } from '@/lib/api/errors';
import type { Me } from '@/lib/api/types';
import { keys } from '@/lib/query/keys';
import { AvatarPicker } from './avatar-picker';

const formatPhone = (phone: string) => phone.replace(/^\+91(\d{5})(\d{5})$/, '+91 $1 $2');

export function ProfileForm({ me }: { me: Me }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [name, setName] = useState(me.name ?? '');
  const [districtId, setDistrictId] = useState(me.district?.id ?? '');
  const [saving, setSaving] = useState(false);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      queryClient.setQueryData(
        keys.me,
        await meApi.update({ name: name.trim(), districtId: districtId || undefined }),
      );
      toast('Profile saved');
    } catch (error) {
      toast(errorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="space-y-5">
      <AvatarPicker kind="avatar" url={me.profileImageUrl} label="photo" />
      <Field label="Name" htmlFor="me-name">
        <Input
          id="me-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
        />
      </Field>
      <div className="space-y-1.5">
        <p className="text-sm font-medium">Phone</p>
        <p className="flex items-center gap-2 text-[15px]">
          {formatPhone(me.phone)}
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-semibold text-success">
            <BadgeCheck className="size-3" aria-hidden /> Verified
          </span>
        </p>
        <p className="text-xs text-muted">Your number is never shown publicly.</p>
      </div>
      <Field label="District" htmlFor="me-district">
        <DistrictSelect id="me-district" value={districtId} onChange={setDistrictId} />
      </Field>
      <Button type="submit" loading={saving} disabled={name.trim().length < 2}>
        Save profile
      </Button>
    </form>
  );
}
