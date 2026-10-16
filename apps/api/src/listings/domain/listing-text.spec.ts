import { buildSearchText, buildSlug, buildTitle } from './listing-text';

const input = {
  listingId: '3f9a1c2e-1111-2222-3333-444455556666',
  year: 2021,
  brand: 'Hyundai',
  model: 'Creta',
  variant: 'SX (O)',
  fuelType: 'DIESEL',
  transmission: 'AUTOMATIC',
  district: 'Ernakulam',
};

describe('listing text', () => {
  it('builds a readable title', () => {
    expect(buildTitle(input)).toBe('2021 Hyundai Creta SX (O)');
  });

  it('builds a url-safe unique slug', () => {
    expect(buildSlug(input)).toBe('2021-hyundai-creta-sx-o-ernakulam-3f9a1c2e');
  });

  it('builds lower-cased search text', () => {
    expect(buildSearchText(input)).toBe('2021 hyundai creta sx (o) diesel automatic ernakulam');
  });
});
