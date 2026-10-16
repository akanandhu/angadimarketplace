import { Injectable, Logger } from '@nestjs/common';
import { App, cert, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { AppConfig } from '../../config/app-config.service';

export interface PushMessage {
  title: string;
  body: string;
  data: Record<string, string>;
}

const STALE_TOKEN_CODES = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
]);

/** FCM delivery (APNs via FCM for iOS). Logs instead of sending when FCM is not configured. */
@Injectable()
export class PushSender {
  private readonly logger = new Logger(PushSender.name);
  private readonly app: App | null;

  constructor(config: AppConfig) {
    const serviceAccount = config.get('FIREBASE_SERVICE_ACCOUNT_JSON');
    this.app = serviceAccount
      ? initializeApp({ credential: cert(JSON.parse(serviceAccount)) }, 'angadi-push')
      : null;
  }

  /** Sends to all tokens and returns the ones FCM reports as no longer valid. */
  async send(tokens: string[], message: PushMessage): Promise<string[]> {
    if (!tokens.length) return [];
    if (!this.app) {
      this.logger.log(`[dry-run] push to ${tokens.length} device(s): ${message.title}`);
      return [];
    }
    const result = await getMessaging(this.app).sendEachForMulticast({
      tokens,
      notification: { title: message.title, body: message.body },
      data: message.data,
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
    return result.responses
      .map((response, index) =>
        !response.success && STALE_TOKEN_CODES.has(response.error?.code ?? '')
          ? tokens[index]
          : null,
      )
      .filter((token): token is string => token !== null);
  }
}
