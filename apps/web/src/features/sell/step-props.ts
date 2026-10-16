import type { SellerListing } from '@/lib/api/types';
import type { CarFormValues } from './car-form';

export interface StepProps {
  listing: SellerListing;
  carForm: Partial<CarFormValues>;
  setCarForm: (patch: Partial<CarFormValues>) => void;
  /** Store the server's latest copy of the listing. */
  onSaved: (listing: SellerListing) => void;
  next: () => void;
  back: () => void;
}
