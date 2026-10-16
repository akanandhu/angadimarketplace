import { createActiveListing } from './support/fixtures';
import { createTestApp, TestApp } from './support/test-app';

const BUYER_PHONE = '9811111111';
const SELLER_PHONE = '9822222222';

describe('Contact requests (e2e)', () => {
  let t: TestApp;
  let buyer: { token: string; userId: string };
  let seller: { token: string; userId: string };

  const as = (token: string) => ({
    post: (url: string, body: object = {}) =>
      t.http().post(`/api/v1${url}`).set('authorization', `Bearer ${token}`).send(body),
    get: (url: string) => t.http().get(`/api/v1${url}`).set('authorization', `Bearer ${token}`),
  });
  const request = (token: string, listingId: string, allowSellerToContact = true) =>
    as(token).post('/contact-requests', { listingId, allowSellerToContact });

  beforeAll(async () => {
    t = await createTestApp();
  });
  afterAll(() => t.close());

  beforeEach(async () => {
    await t.reset();
    buyer = await t.login(BUYER_PHONE, 'Arun');
    seller = await t.login(SELLER_PHONE, 'Meera');
  });

  it('rejects requesting your own listing', async () => {
    const listing = await createActiveListing(t.prisma, seller.userId);
    const res = await request(seller.token, listing.id).expect(422);
    expect(res.body.error.code).toBe('CONTACT_REQUEST_CANNOT_SELF_REQUEST');
  });

  it('allows only one pending request per listing, even concurrently', async () => {
    const listing = await createActiveListing(t.prisma, seller.userId);
    const results = await Promise.all([1, 2, 3].map(() => request(buyer.token, listing.id)));
    expect(results.filter((r) => r.status === 201)).toHaveLength(1);
    for (const r of results.filter((r) => r.status !== 201)) {
      expect(r.body.error.code).toBe('CONTACT_REQUEST_ALREADY_PENDING');
    }
  });

  it('applies the 4-day cooldown only to the rejected listing', async () => {
    const [a, b] = [
      await createActiveListing(t.prisma, seller.userId),
      await createActiveListing(t.prisma, seller.userId),
    ];
    const created = await request(buyer.token, a.id).expect(201);
    await as(seller.token)
      .post(`/contact-requests/${created.body.data.id}/reject`, { reason: 'SUSPECTED_SPAM' })
      .expect(200);

    const again = await request(buyer.token, a.id).expect(409);
    expect(again.body.error.code).toBe('CONTACT_REQUEST_COOLDOWN');
    expect(again.body.error.details.canRequestAgainAt).toBeDefined();
    await request(buyer.token, b.id).expect(201);

    // Once four days have passed the same listing can be requested again.
    await t.prisma.contactRequest.update({
      where: { id: created.body.data.id },
      data: { respondedAt: new Date(Date.now() - 4 * 24 * 3600 * 1000 - 1000) },
    });
    await request(buyer.token, a.id).expect(201);
  });

  it('starts the cooldown when the buyer cancels', async () => {
    const listing = await createActiveListing(t.prisma, seller.userId);
    const created = await request(buyer.token, listing.id).expect(201);
    await as(buyer.token).post(`/contact-requests/${created.body.data.id}/cancel`).expect(200);
    const res = await request(buyer.token, listing.id).expect(409);
    expect(res.body.error.code).toBe('CONTACT_REQUEST_COOLDOWN');
  });

  it('approval creates a seller-wide connection that outlives the source listing', async () => {
    const [a, b, c] = [
      await createActiveListing(t.prisma, seller.userId),
      await createActiveListing(t.prisma, seller.userId),
      await createActiveListing(t.prisma, seller.userId),
    ];
    const first = await request(buyer.token, a.id, false).expect(201);
    const second = await request(buyer.token, b.id).expect(201);

    await as(buyer.token).post(`/contact-requests/${first.body.data.id}/approve`).expect(403);
    await as(seller.token).post(`/contact-requests/${first.body.data.id}/approve`).expect(200);

    const redundant = await t.prisma.contactRequest.findUniqueOrThrow({
      where: { id: second.body.data.id },
    });
    expect(redundant).toMatchObject({ status: 'CANCELLED', cancellationSource: 'SYSTEM' });

    await t.prisma.listing.update({ where: { id: a.id }, data: { status: 'SOLD' } });
    const state = await as(buyer.token)
      .get(`/me/contact-state/sellers/${seller.userId}?listingId=${c.id}`)
      .expect(200);
    expect(state.body.data).toMatchObject({
      state: 'CONNECTED',
      sellerContact: { phone: `+91${SELLER_PHONE}` },
    });

    const blocked = await request(buyer.token, c.id).expect(409);
    expect(blocked.body.error.code).toBe('CONTACT_ALREADY_CONNECTED');

    // The buyer did not allow contact on the approved request, so the seller sees no phone.
    const sellerView = await as(seller.token).get('/me/contact-connections?role=seller');
    expect(sellerView.body.data[0].contact).toBeNull();
  });

  it('shows the buyer phone to the seller only when permitted', async () => {
    const [a, b] = [
      await createActiveListing(t.prisma, seller.userId),
      await createActiveListing(t.prisma, seller.userId),
    ];
    await request(buyer.token, a.id, true).expect(201);
    await request(buyer.token, b.id, false).expect(201);

    const incoming = await as(seller.token).get('/me/contact-requests/incoming').expect(200);
    const byListing = new Map(incoming.body.data.map((r: any) => [r.listing.id, r]));
    expect((byListing.get(a.id) as any).buyerContact.phone).toBe(`+91${BUYER_PHONE}`);
    expect((byListing.get(b.id) as any).buyerContact).toBeNull();

    const me = await as(buyer.token).get('/me').expect(200);
    expect(me.body.data.defaultAllowSellerContact).toBe(false);
  });

  it('never leaks phone numbers or full registration on public listing APIs', async () => {
    const listing = await createActiveListing(t.prisma, seller.userId);
    const detail = await t.http().get(`/api/v1/listings/${listing.slug}`).expect(200);
    const search = await t.http().get('/api/v1/listings').expect(200);
    for (const body of [JSON.stringify(detail.body), JSON.stringify(search.body)]) {
      expect(body).not.toContain(SELLER_PHONE);
      expect(body).not.toMatch(/KL07AB\d{4}/);
    }
    expect(detail.body.data.car.rtoDisplay).toBe('KL 07');
  });
});
