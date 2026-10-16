import { createTestApp, TestApp } from './support/test-app';

describe('Listing lifecycle (e2e)', () => {
  let t: TestApp;
  let seller: { token: string; userId: string };
  let buyer: { token: string; userId: string };

  const as = (token: string) => {
    const auth = (req: any) => req.set('authorization', `Bearer ${token}`);
    return {
      get: (url: string) => auth(t.http().get(`/api/v1${url}`)),
      post: (url: string, body: object = {}) => auth(t.http().post(`/api/v1${url}`)).send(body),
      put: (url: string, body: object = {}) => auth(t.http().put(`/api/v1${url}`)).send(body),
      patch: (url: string, body: object) => auth(t.http().patch(`/api/v1${url}`)).send(body),
    };
  };

  async function catalogue() {
    const hyundai = await t.prisma.vehicleBrand.findUniqueOrThrow({ where: { slug: 'hyundai' } });
    const creta = await t.prisma.vehicleModel.findFirstOrThrow({ where: { slug: 'creta' } });
    const swift = await t.prisma.vehicleModel.findFirstOrThrow({ where: { slug: 'swift' } });
    return { hyundai, creta, swift };
  }

  const carDetails = (brandId: string, modelId: string, extra: object = {}) => ({
    brandId,
    modelId,
    variantText: 'SX Tech',
    manufacturingYear: 2021,
    fuelType: 'DIESEL',
    transmission: 'AUTOMATIC',
    kmDriven: 45000,
    numberOfOwners: 1,
    registrationNumber: 'KL 7 AB 1234',
    ...extra,
  });

  beforeAll(async () => {
    t = await createTestApp();
  });
  afterAll(() => t.close());

  beforeEach(async () => {
    await t.reset();
    seller = await t.login('9833333333', 'Seller');
    buyer = await t.login('9844444444', 'Buyer');
  });

  it('validates the draft, publishes it and retires it when sold', async () => {
    const { hyundai, creta, swift } = await catalogue();
    const draft = await as(seller.token)
      .post('/me/listings/drafts', { category: 'CARS' })
      .expect(201);
    const id = draft.body.data.id;

    const early = await as(seller.token).post(`/me/listings/${id}/publish`).expect(422);
    expect(early.body.error.details.missing).toEqual(['vehicle', 'price', 'district', 'photos']);

    const mismatch = await as(seller.token)
      .put(`/me/listings/${id}/car-details`, carDetails(hyundai.id, swift.id))
      .expect(422);
    expect(mismatch.body.error.code).toBe('INVALID_VEHICLE_CATALOGUE_SELECTION');

    const noVariant = carDetails(hyundai.id, creta.id, { variantText: null });
    await as(seller.token).put(`/me/listings/${id}/car-details`, noVariant).expect(422);

    const saved = await as(seller.token)
      .put(`/me/listings/${id}/car-details`, carDetails(hyundai.id, creta.id))
      .expect(200);
    expect(saved.body.data.car).toMatchObject({
      registrationNumber: 'KL07AB1234',
      rtoCode: 'KL07',
    });

    const district = await t.prisma.district.findFirstOrThrow({ where: { slug: 'thrissur' } });
    await as(seller.token)
      .patch(`/me/listings/${id}`, { price: 1240000, districtId: district.id })
      .expect(200);
    await t.prisma.listingImage.create({
      data: {
        listingId: id,
        status: 'READY',
        position: 0,
        storageKey: `listings/${id}/img`,
        mimeType: 'image/jpeg',
        sizeBytes: 10,
      },
    });

    const published = await as(seller.token).post(`/me/listings/${id}/publish`).expect(200);
    expect(published.body.data).toMatchObject({
      status: 'ACTIVE',
      title: '2021 Hyundai Creta SX Tech',
    });
    const slug = published.body.data.slug;
    expect(slug).toMatch(/^2021-hyundai-creta-sx-tech-thrissur-/);

    const found = await t.http().get('/api/v1/listings?q=creta&districtSlug=thrissur').expect(200);
    expect(found.body.meta.total).toBe(1);

    await as(buyer.token).put(`/me/favourites/${id}`).expect(204);
    await as(seller.token).post(`/me/listings/${id}/mark-sold`).expect(200);
    await as(seller.token).post(`/me/listings/${id}/mark-sold`).expect(409);

    const gone = await t.http().get(`/api/v1/listings/${slug}`).expect(410);
    expect(gone.body.error.details.status).toBe('SOLD');
    expect((await t.http().get('/api/v1/listings').expect(200)).body.meta.total).toBe(0);

    const favourites = await as(buyer.token).get('/me/favourites').expect(200);
    expect(favourites.body.data[0]).toMatchObject({ isAvailable: false });
    const contact = await as(buyer.token)
      .post('/contact-requests', { listingId: id, allowSellerToContact: true })
      .expect(409);
    expect(contact.body.error.code).toBe('LISTING_NOT_ACTIVE');
  });

  it('keeps drafts private and lets owners delete them', async () => {
    const draft = await as(seller.token)
      .post('/me/listings/drafts', { category: 'CARS' })
      .expect(201);
    const id = draft.body.data.id;
    await as(buyer.token).get(`/me/listings/${id}`).expect(403);
    await t.http().delete(`/api/v1/me/listings/${id}`).expect(401);
    await t
      .http()
      .delete(`/api/v1/me/listings/${id}`)
      .set('authorization', `Bearer ${seller.token}`)
      .expect(204);
  });
});
