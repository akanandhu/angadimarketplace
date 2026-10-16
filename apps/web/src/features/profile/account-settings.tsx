'use client';

import { useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { Toggle } from '@/components/ui/toggle';
import { useToast } from '@/components/ui/toast';
import { ChoiceChips } from '@/features/sell/choice-chips';
import { meApi } from '@/lib/api/endpoints/auth';
import { errorMessage } from '@/lib/api/errors';
import type { Me } from '@/lib/api/types';
import { keys } from '@/lib/query/keys';
import { AvatarPicker } from './avatar-picker';

/** Account type (individual / dealer) and the default contact-sharing preference. */
export function AccountSettings({ me }: { me: Me }) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [type, setType] = useState(me.accountType);
  const [businessName, setBusinessName] = useState(me.dealerProfile?.businessName ?? '');
  const [saving, setSaving] = useState(false);
  const refreshMe = () => queryClient.invalidateQueries({ queryKey: keys.me });

  const saveType = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (type === 'DEALER') {
        await meApi.upsertDealerProfile({
          businessName: businessName.trim(),
          districtId: me.district?.id,
        });
      } else {
        await meApi.update({ accountType: 'INDIVIDUAL' });
      }
      await refreshMe();
      toast('Account updated');
    } catch (error) {
      toast(errorMessage(error), 'error');
    } finally {
      setSaving(false);
    }
  };

  const setDefault = async (value: boolean) => {
    try {
      queryClient.setQueryData(keys.me, await meApi.update({ defaultAllowSellerContact: value }));
    } catch (error) {
      toast(errorMessage(error), 'error');
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={saveType} className="space-y-4">
        <h2 className="font-semibold">Account type</h2>
        <ChoiceChips
          name="Account type"
          value={type}
          onChange={setType}
          options={[
            { value: 'INDIVIDUAL', label: 'Individual' },
            { value: 'DEALER', label: 'Dealer / Business' },
          ]}
        />
        {type === 'DEALER' && (
          <>
            <Field label="Business name" htmlFor="business-name">
              <Input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </Field>
            {me.dealerProfile && (
              <AvatarPicker kind="logo" url={me.dealerProfile.logoUrl} label="logo" />
            )}
          </>
        )}
        <Button
          type="submit"
          variant="outline"
          loading={saving}
          disabled={
            (type === me.accountType &&
              (type !== 'DEALER' || businessName === me.dealerProfile?.businessName)) ||
            (type === 'DEALER' && businessName.trim().length < 2)
          }
        >
          Save account type
        </Button>
      </form>

      <section className="space-y-2">
        <h2 className="font-semibold">Contact preference</h2>
        <Toggle
          id="default-allow-contact"
          checked={me.defaultAllowSellerContact}
          onChange={setDefault}
          label="Allow sellers to contact me when I request a vehicle"
          description="This is only the default. You can change it for each request."
        />
      </section>
    </div>
  );
}
