import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../api/api.service';
import { AuthService } from '../auth/auth.service';
import { I18nService } from '../i18n/i18n.service';
import { ToastService } from '../toast/toast.service';

interface PushKeyResponse {
  status: 'success';
  publicKey: string | null;
  enabled: boolean;
}

const urlBase64ToUint8Array = (base64String: string): Uint8Array<ArrayBuffer> => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(new ArrayBuffer(rawData.length));

  for (let index = 0; index < rawData.length; index += 1) {
    output[index] = rawData.charCodeAt(index);
  }

  return output;
};

const isIos = (): boolean => /iPad|iPhone|iPod/.test(navigator.userAgent);

const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

@Injectable({ providedIn: 'root' })
export class PushService {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly i18n = inject(I18nService);
  private readonly toast = inject(ToastService);

  readonly supported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window;
  readonly ios = typeof navigator !== 'undefined' && isIos();
  readonly standalone = typeof window !== 'undefined' && isStandalone();

  readonly available = signal(false);
  readonly subscribed = signal(false);
  readonly permission = signal<NotificationPermission | 'unsupported'>(
    this.supported ? Notification.permission : 'unsupported',
  );
  readonly busy = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');

  private publicKey: string | null = null;

  async load(): Promise<void> {
    if (!this.auth.getToken()) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);

    try {
      await this.registerWorker();
      const response = await firstValueFrom(this.api.get<PushKeyResponse>('/push/public-key'));
      this.publicKey = response.publicKey;
      this.available.set(Boolean(response.publicKey));
      this.permission.set(this.supported ? Notification.permission : 'unsupported');

      if (this.supported) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        this.subscribed.set(Boolean(subscription));
      }

      this.error.set('');
    } catch {
      this.error.set(this.i18n.t('push.error'));
    } finally {
      this.loading.set(false);
    }
  }

  async subscribe(): Promise<void> {
    if (!this.supported || !this.publicKey) return;

    this.busy.set(true);
    this.error.set('');

    try {
      const permission = await Notification.requestPermission();
      this.permission.set(permission);

      if (permission !== 'granted') {
        this.error.set(this.i18n.t('push.permissionDeniedToast'));
        this.toast.error(this.i18n.t('push.permissionDeniedToast'));
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const existing = await registration.pushManager.getSubscription();
      const subscription =
        existing ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(this.publicKey),
        }));

      const serialized = subscription.toJSON();
      const p256dh = serialized.keys?.['p256dh'];
      const authKey = serialized.keys?.['auth'];

      if (!p256dh || !authKey) {
        throw new Error('Push subscription keys missing');
      }

      await firstValueFrom(
        this.api.post('/push/subscribe', {
          endpoint: subscription.endpoint,
          keys: { p256dh, auth: authKey },
          userAgent: navigator.userAgent.slice(0, 255),
        }),
      );

      this.subscribed.set(true);
      this.toast.success(this.i18n.t('push.subscribedToast'));
    } catch {
      this.error.set(this.i18n.t('push.subscribeError'));
      this.toast.error(this.i18n.t('push.subscribeError'));
    } finally {
      this.busy.set(false);
    }
  }

  async unsubscribe(): Promise<void> {
    if (!this.supported) return;

    this.busy.set(true);
    this.error.set('');

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await firstValueFrom(
          this.api.delete('/push/unsubscribe', { endpoint: subscription.endpoint }),
        );
        await subscription.unsubscribe();
      }

      this.subscribed.set(false);
      this.toast.success(this.i18n.t('push.unsubscribedToast'));
    } catch {
      this.error.set(this.i18n.t('push.unsubscribeError'));
      this.toast.error(this.i18n.t('push.unsubscribeError'));
    } finally {
      this.busy.set(false);
    }
  }

  async registerWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;

    try {
      await navigator.serviceWorker.register('/sw.js');
    } catch {
      // Push is optional; a failed registration should not break the page.
    }
  }
}
