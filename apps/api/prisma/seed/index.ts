import { seedCatalogue } from './catalogue';
import { prisma } from './client';
import { seedCategories, seedLocations } from './locations';

async function seedAdmin() {
  const phone = process.env.SEED_ADMIN_PHONE;
  if (!phone) return;
  await prisma.user.upsert({
    where: { phone },
    update: { role: 'ADMIN' },
    create: { phone, name: 'Angadi Admin', role: 'ADMIN' },
  });
  console.log(`Ensured admin user ${phone}`);
}

async function main() {
  await seedLocations();
  await seedCategories();
  await seedCatalogue();
  await seedAdmin();
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
