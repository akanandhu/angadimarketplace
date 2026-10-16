import { prisma, slugify } from './client';

const KERALA_DISTRICTS = [
  'Thiruvananthapuram',
  'Kollam',
  'Pathanamthitta',
  'Alappuzha',
  'Kottayam',
  'Idukki',
  'Ernakulam',
  'Thrissur',
  'Palakkad',
  'Malappuram',
  'Kozhikode',
  'Wayanad',
  'Kannur',
  'Kasaragod',
];

export async function seedLocations() {
  const kerala = await prisma.state.upsert({
    where: { code: 'KL' },
    update: {},
    create: { code: 'KL', name: 'Kerala', slug: 'kerala' },
  });

  for (const [index, name] of KERALA_DISTRICTS.entries()) {
    await prisma.district.upsert({
      where: { slug: slugify(name) },
      update: { sortOrder: index },
      create: { stateId: kerala.id, name, slug: slugify(name), sortOrder: index },
    });
  }
  console.log(`Seeded Kerala with ${KERALA_DISTRICTS.length} districts`);
}

export async function seedCategories() {
  await prisma.category.upsert({
    where: { code: 'CARS' },
    update: {},
    create: { code: 'CARS', name: 'Cars', slug: 'cars' },
  });
  console.log('Seeded categories');
}
