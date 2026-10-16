import sharp from 'sharp';
import { InvalidImageError, transformImage } from './transform';

const jpeg = (width: number, height: number, orientation?: number) =>
  sharp({ create: { width, height, channels: 3, background: '#2a7' } })
    .jpeg()
    .withMetadata(orientation ? { orientation } : {})
    .toBuffer();

describe('transformImage', () => {
  it('renders three webp variants without enlarging', async () => {
    const result = await transformImage(await jpeg(1000, 500));
    expect(result.variants.map((v) => v.name)).toEqual(['thumb', 'card', 'detail']);
    const widths = await Promise.all(
      result.variants.map(async (v) => (await sharp(v.body).metadata()).width),
    );
    expect(widths).toEqual([300, 700, 1000]);
    expect((await sharp(result.variants[0].body).metadata()).format).toBe('webp');
  });

  it('applies EXIF orientation and strips metadata', async () => {
    const result = await transformImage(await jpeg(400, 200, 6));
    expect([result.width, result.height]).toEqual([200, 400]);
    const meta = await sharp(result.variants[2].body).metadata();
    expect(meta.exif).toBeUndefined();
  });

  it('rejects non-image content', async () => {
    await expect(transformImage(Buffer.from('not an image'))).rejects.toBeInstanceOf(
      InvalidImageError,
    );
  });
});
