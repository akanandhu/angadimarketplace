import { Prisma } from '../../generated/prisma/client';
import { CAR_DETAILS_INCLUDE } from '../listing-includes';
import { formatRtoCode } from '../domain/registration';

type CarDetailsWithCatalogue = Prisma.CarDetailsGetPayload<{
  include: typeof CAR_DETAILS_INCLUDE;
}>;

/** Public car facts. Deliberately omits the full registration number. */
export function presentPublicCar(car: CarDetailsWithCatalogue) {
  return {
    brand: { id: car.brand.id, name: car.brand.name, slug: car.brand.slug },
    model: { id: car.model.id, name: car.model.name, slug: car.model.slug },
    variant: car.variant?.name ?? car.variantText,
    variantId: car.variantId,
    manufacturingYear: car.manufacturingYear,
    fuelType: car.fuelType,
    transmission: car.transmission,
    kmDriven: car.kmDriven,
    numberOfOwners: car.numberOfOwners,
    rtoCode: car.rtoCode,
    rtoDisplay: formatRtoCode(car.rtoCode),
    accidentHistory: car.accidentHistory,
    hasMajorReplacement: car.hasMajorReplacement,
    replacementDetails: car.replacementDetails,
    colour: car.colour,
    insuranceType: car.insuranceType,
    insuranceValidUntil: car.insuranceValidUntil?.toISOString().slice(0, 10) ?? null,
  };
}

/** Owner-only view: adds the editable inputs including the full registration. */
export function presentOwnerCar(car: CarDetailsWithCatalogue) {
  return {
    ...presentPublicCar(car),
    variantText: car.variantText,
    registrationNumber: car.registrationNumber,
  };
}
