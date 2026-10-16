'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { EmptyState, ErrorState, Skeleton } from '@/components/ui/feedback';
import { useToast } from '@/components/ui/toast';
import { sellerApi } from '@/lib/api/endpoints/seller';
import { errorMessage } from '@/lib/api/errors';
import type { SellerListing } from '@/lib/api/types';
import { keys } from '@/lib/query/keys';
import { routes } from '@/lib/routes';
import { CarFormValues, carFormFromListing, pendingVehicleStore } from './car-form';
import { PublishSuccess } from './publish-success';
import { SELL_STEPS, Stepper } from './stepper';
import { DescriptionStep } from './steps/description-step';
import { DistrictStep } from './steps/district-step';
import { PhotosStep } from './steps/photos-step';
import { PreviewStep } from './steps/preview-step';
import { PriceStep } from './steps/price-step';
import { RegistrationStep } from './steps/registration-step';
import { VehicleStep } from './steps/vehicle-step';

export function SellScreen({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const step = Math.min(Number(useSearchParams().get('step') ?? 0) || 0, SELL_STEPS.length - 1);
  const [published, setPublished] = useState(false);
  const [carForm, setCarFormState] = useState<Partial<CarFormValues> | null>(null);

  const query = useQuery({
    queryKey: keys.myListing(id),
    queryFn: () => sellerApi.get(id),
    refetchInterval: (q) => (q.state.data?.hasPendingImages ? 2000 : false),
  });
  const listing = query.data;

  useEffect(() => {
    if (listing && !carForm) {
      setCarFormState({ ...carFormFromListing(listing), ...pendingVehicleStore.load(listing.id) });
    }
  }, [listing, carForm]);

  const goTo = useCallback(
    (index: number) => {
      router.replace(`${routes.sell(id)}&step=${index}`, { scroll: false });
      window.scrollTo({ top: 0 });
    },
    [router, id],
  );
  const onSaved = (saved: SellerListing) => {
    queryClient.setQueryData(keys.myListing(id), saved);
    void queryClient.invalidateQueries({
      queryKey: ['my-listings'],
      exact: false,
      refetchType: 'none',
    });
  };
  const refresh = () => query.refetch();

  if (query.isError) return <ErrorState message={errorMessage(query.error)} />;
  if (!listing || !carForm) {
    return (
      <div className="mx-auto max-w-xl space-y-4 px-4 py-8">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (published && listing.status === 'ACTIVE') return <PublishSuccess listing={listing} />;
  if (listing.status === 'SOLD' || listing.status === 'REMOVED') {
    return (
      <EmptyState
        title="This listing can no longer be edited"
        description={`It is ${listing.status.toLowerCase()}.`}
      />
    );
  }

  const props = {
    listing,
    carForm,
    setCarForm: (patch: Partial<CarFormValues>) => setCarFormState((c) => ({ ...c, ...patch })),
    onSaved,
    next: () => goTo(step + 1),
    back: () => goTo(Math.max(step - 1, 0)),
  };
  const exit = () => {
    if (listing.status === 'DRAFT') toast('Your draft has been saved.');
    router.push(routes.myListings(listing.status === 'DRAFT' ? 'DRAFT' : undefined));
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <div className="mb-6 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">
            {listing.status === 'DRAFT' ? 'Sell your car' : 'Edit listing'}
          </h1>
          <button type="button" onClick={exit} className="text-sm font-semibold text-brand">
            {listing.status === 'DRAFT' ? 'Save & exit' : 'Close'}
          </button>
        </div>
        <Stepper step={step} />
      </div>
      {step === 0 && <VehicleStep {...props} />}
      {step === 1 && <RegistrationStep {...props} />}
      {step === 2 && <PriceStep {...props} />}
      {step === 3 && <DistrictStep {...props} />}
      {step === 4 && <PhotosStep {...props} refresh={refresh} />}
      {step === 5 && <DescriptionStep {...props} />}
      {step === 6 && (
        <PreviewStep
          {...props}
          goTo={goTo}
          onPublished={() =>
            listing.status === 'DRAFT' ? setPublished(true) : router.push(routes.myListings())
          }
        />
      )}
    </div>
  );
}
