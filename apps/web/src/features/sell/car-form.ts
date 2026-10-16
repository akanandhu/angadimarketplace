import { z } from 'zod';
import type { SellerListing } from '@/lib/api/types';

const THIS_YEAR = new Date().getFullYear();

export const vehicleSchema = z
  .object({
    brandId: z.string().min(1, 'Select a brand'),
    modelId: z.string().min(1, 'Select a model'),
    variantId: z.string(),
    variantText: z.string().trim().max(80),
    manualVariant: z.boolean(),
    manufacturingYear: z
      .number({ error: 'Select the year' })
      .int()
      .min(1980)
      .max(THIS_YEAR + 1),
    fuelType: z.string().min(1, 'Select fuel type'),
    transmission: z.string().min(1, 'Select transmission'),
    kmDriven: z.number({ error: 'Enter KM driven' }).int().min(0).max(2_000_000),
    numberOfOwners: z.number({ error: 'Select number of owners' }).int().min(1).max(10),
  })
  .refine((v) => (v.manualVariant ? v.variantText.length > 0 : v.variantId.length > 0), {
    message: 'Select a variant or enter it manually',
    path: ['variantId'],
  });

export const registrationSchema = z
  .object({
    registrationNumber: z
      .string()
      .trim()
      .min(4, 'Enter the registration number')
      .regex(/^[A-Za-z0-9 -]+$/, 'Use letters and numbers only, e.g. KL 07 AB 1234'),
    accidentHistory: z.string(),
    hasMajorReplacement: z.enum(['', 'yes', 'no']),
    replacementDetails: z.string().trim().max(500),
  })
  .refine((v) => v.hasMajorReplacement !== 'yes' || v.replacementDetails.length > 0, {
    message: 'Describe what was replaced',
    path: ['replacementDetails'],
  });

export type VehicleValues = z.infer<typeof vehicleSchema>;
export type RegistrationValues = z.infer<typeof registrationSchema>;
export type CarFormValues = VehicleValues & RegistrationValues;

/** Prefills the wizard from what the server already has for this draft. */
export function carFormFromListing(listing: SellerListing): Partial<CarFormValues> {
  const car = listing.car;
  if (!car) return {};
  return {
    brandId: car.brand.id,
    modelId: car.model.id,
    variantId: car.variantId ?? '',
    variantText: car.variantText ?? '',
    manualVariant: !car.variantId,
    manufacturingYear: car.manufacturingYear,
    fuelType: car.fuelType,
    transmission: car.transmission,
    kmDriven: car.kmDriven,
    numberOfOwners: car.numberOfOwners,
    registrationNumber: car.registrationNumber,
    accidentHistory: car.accidentHistory ?? '',
    hasMajorReplacement:
      car.hasMajorReplacement == null ? '' : car.hasMajorReplacement ? 'yes' : 'no',
    replacementDetails: car.replacementDetails ?? '',
  };
}

/** Unsaved step-1 answers survive leaving the wizard (they are only sent with step 2). */
export const pendingVehicleStore = {
  key: (id: string) => `angadi.sell.${id}.vehicle`,
  load(id: string): Partial<VehicleValues> | null {
    try {
      return JSON.parse(localStorage.getItem(this.key(id)) ?? 'null');
    } catch {
      return null;
    }
  },
  save(id: string, values: VehicleValues) {
    try {
      localStorage.setItem(this.key(id), JSON.stringify(values));
    } catch {
      // Storage unavailable: the values stay in memory for this session.
    }
  },
  clear(id: string) {
    try {
      localStorage.removeItem(this.key(id));
    } catch {
      // ignore
    }
  },
};
