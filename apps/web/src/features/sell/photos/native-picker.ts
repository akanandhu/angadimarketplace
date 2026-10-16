import { Capacitor } from '@capacitor/core';

export const canUseNativeCamera = () => Capacitor.isNativePlatform();

/** Camera or gallery on Capacitor; returns blobs ready for prepareImage. */
export async function pickNativePhotos(
  source: 'camera' | 'gallery',
  limit: number,
): Promise<Blob[]> {
  const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera');
  if (source === 'camera') {
    const photo = await Camera.getPhoto({
      source: CameraSource.Camera,
      resultType: CameraResultType.Uri,
      quality: 85,
      correctOrientation: true,
    });
    return photo.webPath ? [await (await fetch(photo.webPath)).blob()] : [];
  }
  const picked = await Camera.pickImages({ limit, quality: 85 });
  return Promise.all(picked.photos.map(async (p) => (await fetch(p.webPath)).blob()));
}
