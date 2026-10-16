import { Global, Injectable, Logger, Module, OnApplicationShutdown } from '@nestjs/common';
import { PostHog } from 'posthog-node';
import { AppConfig } from '../config/app-config.service';

export type ServerEvent =
  | 'listing_published'
  | 'listing_marked_sold'
  | 'contact_request_sent'
  | 'contact_request_approved'
  | 'contact_request_rejected';

/**
 * Behavioural analytics only. Never read back as product truth — seller-facing
 * metrics come from ListingStats.
 */
@Injectable()
export class AnalyticsService implements OnApplicationShutdown {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly client: PostHog | null;

  constructor(config: AppConfig) {
    const key = config.get('POSTHOG_API_KEY');
    this.client = key ? new PostHog(key, { host: config.get('POSTHOG_HOST') }) : null;
  }

  capture(userId: string, event: ServerEvent, properties: Record<string, unknown> = {}) {
    try {
      this.client?.capture({ distinctId: userId, event, properties });
    } catch (error) {
      this.logger.warn(`Failed to capture ${event}: ${String(error)}`);
    }
  }

  async onApplicationShutdown() {
    await this.client?.shutdown();
  }
}

@Global()
@Module({ providers: [AnalyticsService], exports: [AnalyticsService] })
export class AnalyticsModule {}
