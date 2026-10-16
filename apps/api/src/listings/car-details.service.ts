import { Injectable } from '@nestjs/common';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { PrismaService } from '../prisma/prisma.service';
import { VehicleCatalogueService } from '../vehicle-catalogue/vehicle-catalogue.service';
import { normalizeRegistration } from './domain/registration';
import { CarDetailsDto } from './dto/car-details.dto';
import { ListingAccessService } from './listing-access.service';
import { ListingPublisherService } from './listing-publisher.service';

@Injectable()
export class CarDetailsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: ListingAccessService,
    private readonly catalogue: VehicleCatalogueService,
    private readonly publisher: ListingPublisherService,
  ) {}

  /** Replaces the car details of a draft or active listing after validating the catalogue. */
  async put(listingId: string, userId: string, dto: CarDetailsDto): Promise<void> {
    const listing = await this.access.findOwned(listingId, userId, ['DRAFT', 'ACTIVE']);
    if (listing.category.code !== 'CARS') {
      throw AppException.unprocessable(ErrorCode.VALIDATION_ERROR, 'Listing is not a car');
    }

    const variantId = dto.variantId ?? null;
    const variantText = variantId ? null : dto.variantText?.trim() || null;
    if (!variantId && !variantText) {
      throw AppException.unprocessable(
        ErrorCode.INVALID_VEHICLE_CATALOGUE_SELECTION,
        'Select a variant or enter it manually',
      );
    }
    await this.catalogue.assertSelection({
      brandId: dto.brandId,
      modelId: dto.modelId,
      variantId,
    });

    const registration = normalizeRegistration(dto.registrationNumber);
    if (!registration) {
      throw AppException.unprocessable(
        ErrorCode.INVALID_REGISTRATION_NUMBER,
        'Enter a valid registration number, e.g. KL 07 AB 1234',
      );
    }

    const data = {
      brandId: dto.brandId,
      modelId: dto.modelId,
      variantId,
      variantText,
      manufacturingYear: dto.manufacturingYear,
      fuelType: dto.fuelType,
      transmission: dto.transmission,
      kmDriven: dto.kmDriven,
      numberOfOwners: dto.numberOfOwners,
      registrationNumber: registration.full,
      rtoCode: registration.rtoCode,
      accidentHistory: dto.accidentHistory ?? null,
      hasMajorReplacement: dto.hasMajorReplacement ?? null,
      replacementDetails: dto.hasMajorReplacement ? dto.replacementDetails?.trim() || null : null,
      colour: dto.colour?.trim() || null,
      insuranceType: dto.insuranceType ?? null,
      insuranceValidUntil: dto.insuranceValidUntil ? new Date(dto.insuranceValidUntil) : null,
    };
    await this.prisma.carDetails.upsert({
      where: { listingId },
      create: { listingId, ...data },
      update: data,
    });
    await this.publisher.refreshDerivedText(listingId, userId);
  }
}
