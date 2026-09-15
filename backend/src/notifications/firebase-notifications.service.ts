import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { App, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

export type PushNotificationPayload = {
  title: string;
  body: string;
  data?: Record<string, string>;
};

@Injectable()
export class FirebaseNotificationsService {
  private readonly logger = new Logger(FirebaseNotificationsService.name);
  private readonly app: App | null;

  constructor(private readonly config: ConfigService) {
    const projectId = this.config.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.config.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.config.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      this.app = null;
      this.logger.warn('Firebase push notifications are disabled because Firebase env vars are missing.');
      return;
    }

    this.app = getApps()[0] ?? initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }

  get enabled() {
    return Boolean(this.app);
  }

  async sendToTokens(tokens: string[], payload: PushNotificationPayload) {
    if (!this.app || !tokens.length) return { successCount: 0, failureCount: 0, invalidTokens: [] };

    const response = await getMessaging(this.app).sendEachForMulticast({
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: payload.data,
    });

    const invalidTokens = response.responses
      .map((result, index) => {
        const code = result.error?.code;
        return code === 'messaging/invalid-registration-token' || code === 'messaging/registration-token-not-registered'
          ? tokens[index]
          : null;
      })
      .filter((token): token is string => Boolean(token));

    return {
      successCount: response.successCount,
      failureCount: response.failureCount,
      invalidTokens,
    };
  }
}
