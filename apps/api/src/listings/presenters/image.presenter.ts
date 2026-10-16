import { ListingImage } from '../../generated/prisma/client';
import { MediaUrlService } from '../../media/media-url.service';

export function presentOwnerImage(image: ListingImage, index: number, media: MediaUrlService) {
  return {
    id: image.id,
    status: image.status,
    position: image.position,
    isCover: index === 0,
    urls: image.status === 'READY' ? media.variants(image.storageKey) : null,
    failureReason: image.failureReason,
  };
}

/** Public galleries only ever contain fully processed images. */
export function readyImages(images: ListingImage[]): ListingImage[] {
  return images.filter((image) => image.status === 'READY');
}
