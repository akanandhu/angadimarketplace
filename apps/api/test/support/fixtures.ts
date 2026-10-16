import { PrismaService } from '../../src/prisma/prisma.service';

let counter = 0;

/** Inserts a published car listing with one READY photo, bypassing S3. */
export async function createActiveListing(prisma: PrismaService, sellerId: string) {
  counter += 1;
  const [category, district, model] = await Promise.all([
    prisma.category.findUniqueOrThrow({ where: { code: 'CARS' } }),
    prisma.district.findFirstOrThrow({ where: { slug: 'ernakulam' } }),
    prisma.vehicleModel.findFirstOrThrow({ where: { slug: 'creta' }, include: { brand: true } }),
  ]);
  const listing = await prisma.listing.create({
    data: {
      sellerId,
      categoryId: category.id,
      districtId: district.id,
      status: 'ACTIVE',
      title: `2021 Hyundai Creta SX #${counter}`,
      slug: `2021-hyundai-creta-sx-test-${counter}-${Date.now()}`,
      searchText: '2021 hyundai creta sx diesel automatic ernakulam',
      price: 1_240_000,
      publishedAt: new Date(),
      stats: { create: {} },
      carDetails: {
        create: {
          brandId: model.brandId,
          modelId: model.id,
          variantText: 'SX',
          manufacturingYear: 2021,
          fuelType: 'DIESEL',
          transmission: 'AUTOMATIC',
          kmDriven: 45000,
          numberOfOwners: 1,
          registrationNumber: `KL07AB${1000 + counter}`,
          rtoCode: 'KL07',
        },
      },
    },
  });
  await prisma.listingImage.create({
    data: {
      listingId: listing.id,
      status: 'READY',
      position: 0,
      storageKey: `listings/${listing.id}/test-image`,
      mimeType: 'image/jpeg',
      sizeBytes: 1000,
    },
  });
  return listing;
}
