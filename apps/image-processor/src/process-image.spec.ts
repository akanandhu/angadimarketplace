import { parseSourceKey } from './process-image';

const id = '3f9a1c2e-1111-2222-3333-444455556666';
const img = '9b8a7c6d-1111-2222-3333-444455556666';

describe('parseSourceKey', () => {
  it('extracts the image id and storage prefix', () => {
    expect(parseSourceKey(`listings/${id}/${img}/source.jpg`)).toEqual({
      storageKey: `listings/${id}/${img}`,
      imageId: img,
      owner: 'listing',
    });
  });

  it('recognises profile photos and dealer logos', () => {
    expect(parseSourceKey(`users/${id}/logo/${img}/source.png`)).toEqual({
      storageKey: `users/${id}/logo/${img}`,
      imageId: img,
      owner: 'user',
    });
    expect(parseSourceKey(`users/${id}/other/${img}/source.png`)).toBeNull();
  });

  it('ignores generated variants to avoid processing loops', () => {
    expect(parseSourceKey(`listings/${id}/${img}/card.webp`)).toBeNull();
  });
});
