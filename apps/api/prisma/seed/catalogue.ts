import { prisma, slugify } from './client';
import { MORE_BRANDS } from './data/brands-more';
import { POPULAR_BRANDS } from './data/brands-popular';

export async function seedCatalogue() {
  const brands = [...POPULAR_BRANDS, ...MORE_BRANDS];
  let modelCount = 0;
  let variantCount = 0;

  for (const seedBrand of brands) {
    const brand = await prisma.vehicleBrand.upsert({
      where: { slug: slugify(seedBrand.name) },
      update: { sortOrder: seedBrand.sortOrder },
      create: {
        name: seedBrand.name,
        slug: slugify(seedBrand.name),
        sortOrder: seedBrand.sortOrder,
      },
    });

    for (const seedModel of seedBrand.models) {
      const slug = slugify(seedModel.name);
      const model = await prisma.vehicleModel.upsert({
        where: { brandId_slug: { brandId: brand.id, slug } },
        update: {},
        create: { brandId: brand.id, name: seedModel.name, slug },
      });
      modelCount++;

      for (const name of seedModel.variants) {
        await prisma.vehicleVariant.upsert({
          where: { modelId_name: { modelId: model.id, name } },
          update: {},
          create: { modelId: model.id, name },
        });
        variantCount++;
      }
    }
  }
  console.log(`Seeded ${brands.length} brands, ${modelCount} models, ${variantCount} variants`);
}
