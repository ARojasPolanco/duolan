import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import type { Observable } from 'rxjs';
import { Subscription, tap } from 'rxjs';
import { NotificationsService } from '../api/notifications.service';
import type {
  AppNotification,
  NotificationEventPayload,
  NotificationMutationResponse,
} from '../api/models/notification.model';
import { AuthService } from '../auth/auth.service';
import { I18nService } from '../i18n/i18n.service';
import { localizeNotification } from './notification-text';
import { SseService } from '../realtime/sse.service';
import { ToastService } from '../toast/toast.service';

@Injectable({ providedIn: 'root' })
export class NotificationsStore {
  private readonly api = inject(NotificationsService);
  private readonly sse = inject(SseService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(I18nService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _notifications = signal<AppNotification[]>([]);
  private readonly _unreadCount = signal(0);
  private readonly _loading = signal(false);
  private readonly _error = signal('');

  readonly notifications = this._notifications.asReadonly();
  readonly unreadCount = this._unreadCount.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly sseStatus = this.sse.status;
  readonly hasUnread = computed(() => this._unreadCount() > 0);

  private running = false;
  private eventSubscription: Subscription | null = null;

  start(): void {
    if (this.running) return;
    this.running = true;

    this.eventSubscription = this.sse.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((payload) => this.handleEvent(payload));

    this.load();
    this.sse.start(() => this.load());
  }

  stop(): void {
    this.running = false;
    this.eventSubscription?.unsubscribe();
    this.eventSubscription = null;
    this.sse.stop();
  }

  load(): void {
    if (!this.auth.getToken()) {
      this._notifications.set([]);
      this._unreadCount.set(0);
      this._loading.set(false);
      return;
    }

    this._loading.set(true);

    this.api
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this._notifications.set(response.notifications);
          this._unreadCount.set(response.unreadCount);
          this._error.set('');
          this._loading.set(false);
        },
        error: () => {
          this._error.set(this.i18n.t('notifications.loadError'));
          this._loading.set(false);
        },
      });
  }

  refresh(): void {
    this.load();
  }

  markRead(id: string): Observable<NotificationMutationResponse> {
    const target = this._notifications().find((notification) => notification.id === id);

    return this.api.markRead(id).pipe(
      tap(() => {
        this._notifications.update((items) =>
          items.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
        );
        if (target && !target.isRead) {
          this._unreadCount.update((count) => Math.max(0, count - 1));
        }
      }),
    );
  }

  markAllRead(): Observable<NotificationMutationResponse> {
    return this.api.markAllRead().pipe(
      tap(() => {
        this._notifications.update((items) => items.map((item) => ({ ...item, isRead: true })));
        this._unreadCount.set(0);
      }),
    );
  }

  remove(id: string): Observable<NotificationMutationResponse> {
    const target = this._notifications().find((notification) => notification.id === id);

    return this.api.remove(id).pipe(
      tap(() => {
        this._notifications.update((items) => items.filter((item) => item.id !== id));
        if (target && !target.isRead) {
          this._unreadCount.update((count) => Math.max(0, count - 1));
        }
      }),
    );
  }

  private handleEvent(payload: NotificationEventPayload | null): void {
    const info = payload?.data;

    if (info?.title && this.router.url.split('?')[0] !== '/notificaciones') {
      const text = localizeNotification(this.i18n, {
        type: info.notificationType,
        title: info.title,
        message: info.message,
      });
      const message = text.message ? `${text.title} - ${text.message}` : text.title;
      this.toast.info(message);
    }

    if (info?.notificationType === 'username_changed') {
      this.auth.refreshProfile().subscribe({ error: () => undefined });
    }

    this.load();
  }
}
