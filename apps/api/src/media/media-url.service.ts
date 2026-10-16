import { Global, Injectable, Module } from '@nestjs/common';
import { AppConfig } from '../config/app-config.service';

export type ImageVariant = 'thumb' | 'card' | 'detail';

/** Builds CDN URLs from logical storage keys; the DB never stores full URLs. */
@Injectable()
export class MediaUrlService {
  constructor(private readonly config: AppConfig) {}

  url(key: string | null | undefined): string | null {
    return key ? `${this.config.get('CDN_BASE_URL')}/${key}` : null;
  }

  /** Processed variant of an optional image prefix (profile photos, dealer logos). */
  image(storageKey: string | null | undefined, variant: ImageVariant = 'card'): string | null {
    return storageKey ? this.variant(storageKey, variant) : null;
  }

  variant(storageKey: string, variant: ImageVariant): string {
    return `${this.config.get('CDN_BASE_URL')}/${storageKey}/${variant}.webp`;
  }

  variants(storageKey: string) {
    return {
      thumb: this.variant(storageKey, 'thumb'),
      card: this.variant(storageKey, 'card'),
      detail: this.variant(storageKey, 'detail'),
    };
  }
}

@Global()
@Module({ providers: [MediaUrlService], exports: [MediaUrlService] })
export class MediaUrlModule {}
