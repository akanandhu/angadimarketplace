import { Prisma } from '../generated/prisma/client';
import { ListingSort, SearchListingsDto } from './dto/search-listings.dto';

const range = (min?: number, max?: number) =>
  min === undefined && max === undefined ? undefined : { gte: min, lte: max };

/** Translates search params into a Prisma filter over ACTIVE listings. */
export function buildListingWhere(
  query: SearchListingsDto,
  textMatchIds?: string[],
): Prisma.ListingWhereInput {
  const car: Prisma.CarDetailsWhereInput = {
    brandId: query.brandId,
    brand: query.brandSlug ? { slug: query.brandSlug } : undefined,
    modelId: query.modelId,
    model: query.modelSlug ? { slug: query.modelSlug } : undefined,
    variantId: query.variantId,
    manufacturingYear: range(query.minYear, query.maxYear),
    kmDriven: range(query.minKm, query.maxKm),
    numberOfOwners: query.numberOfOwners ? { lte: query.numberOfOwners } : undefined,
    fuelType: query.fuelType?.length ? { in: query.fuelType } : undefined,
    transmission: query.transmission?.length ? { in: query.transmission } : undefined,
  };
  const hasCarFilter = Object.values(car).some((value) => value !== undefined);

  return {
    status: 'ACTIVE',
    category: { code: query.category.toUpperCase() },
    districtId: query.districtId,
    district: query.districtSlug ? { slug: query.districtSlug } : undefined,
    sellerId: query.sellerId,
    price: range(query.minPrice, query.maxPrice),
    id: {
      ...(textMatchIds ? { in: textMatchIds } : {}),
      ...(query.excludeListingId ? { not: query.excludeListingId } : {}),
    },
    ...(hasCarFilter ? { carDetails: car } : {}),
  };
}

export function buildListingOrder(sort: ListingSort): Prisma.ListingOrderByWithRelationInput[] {
  switch (sort) {
    case 'price_asc':
      return [{ price: 'asc' }, { id: 'asc' }];
    case 'price_desc':
      return [{ price: 'desc' }, { id: 'asc' }];
    case 'km_asc':
      return [{ carDetails: { kmDriven: 'asc' } }, { id: 'asc' }];
    default:
      return [{ publishedAt: 'desc' }, { id: 'asc' }];
  }
}
