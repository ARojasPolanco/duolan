import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import type { AppNotification } from '../../../core/api/models/notification.model';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import type { TranslationKey } from '../../../core/i18n/translations';
import { NotificationsStore } from '../../../core/notifications/notifications.store';
import { PushService } from '../../../core/push/push.service';
import type { SseStatus } from '../../../core/realtime/sse.service';
import { ToastService } from '../../../core/toast/toast.service';
import { formatDateTime } from '../../../core/utils/time';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton.component';

const SSE_LABEL_KEYS: Record<SseStatus, TranslationKey> = {
  idle: 'label.sse.idle',
  connecting: 'label.sse.connecting',
  open: 'label.sse.open',
  reconnecting: 'label.sse.reconnecting',
  polling: 'label.sse.polling',
};

@Component({
  selector: 'app-notifications-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CardComponent, SkeletonComponent],
  template: `
    <div class="grid gap-5">
      <header class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {{ i18n.t('notifications.eyebrow') }}
          </p>
          <h1 class="mt-2 text-2xl font-extrabold sm:text-3xl">
            {{ i18n.t('notifications.title') }}
          </h1>
          <p class="mt-2 text-sm text-muted">
            {{ unreadLabel() }} · {{ i18n.t(SSE_LABEL_KEYS[store.sseStatus()]) }}
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <app-button variant="secondary" size="sm" (click)="store.refresh()">
            {{ i18n.t('notifications.reload') }}
          </app-button>
          <app-button variant="secondary" size="sm" (click)="markAllRead()">
            {{ i18n.t('notifications.markAll') }}
          </app-button>
        </div>
      </header>

      <app-card padding="sm">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="text-sm font-bold">{{ i18n.t('push.title') }}</h2>
            <p class="mt-1 text-[11px] text-muted">{{ pushLabel() }}</p>
          </div>

          @if (push.available() && push.supported) {
            <app-button
              [variant]="push.subscribed() ? 'secondary' : 'primary'"
              size="sm"
              [loading]="push.busy()"
              (click)="togglePush()"
            >
              {{
                push.busy()
                  ? i18n.t('push.processing')
                  : push.subscribed()
                    ? i18n.t('push.disable')
                    : i18n.t('push.enable')
              }}
            </app-button>
          }
        </div>

        @if (push.ios && !push.standalone) {
          <p
            class="mt-3 rounded-xl border border-gold/40 bg-gold/10 px-3 py-2.5 text-[11px] text-gold"
          >
            {{ i18n.t('push.iosHint') }}
          </p>
        }

        @if (push.error()) {
          <p
            class="mt-3 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2.5 text-[11px] text-danger"
          >
            {{ push.error() }}
          </p>
        }

        @if (push.permission() === 'denied') {
          <p class="mt-3 text-[11px] text-muted">{{ i18n.t('push.permissionDenied') }}</p>
        }
      </app-card>

      @if (store.error()) {
        <p class="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          {{ store.error() }}
        </p>
      }

      @if (store.loading()) {
        <div class="grid gap-3">
          <app-skeleton variant="card" />
          <app-skeleton variant="card" />
          <app-skeleton variant="card" />
        </div>
      } @else if (store.notifications().length === 0) {
        <app-card padding="lg">
          <div class="py-6 text-center">
            <h2 class="text-lg font-bold">{{ i18n.t('notifications.emptyTitle') }}</h2>
            <p class="mx-auto mt-2 max-w-md text-sm text-muted">
              {{ i18n.t('notifications.emptyBody') }}
            </p>
          </div>
        </app-card>
      } @else {
        <div class="grid gap-2">
          @for (notification of store.notifications(); track notification.id) {
            <article [class]="notificationCardClass(notification.isRead)">
              <div class="flex items-start gap-3">
                <button
                  type="button"
                  (click)="openNotification(notification)"
                  class="flex min-w-0 flex-1 items-start gap-3 text-left"
                >
                  <span
                    class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-sm font-bold text-accent"
                    aria-hidden="true"
                  >
                    !
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="flex flex-wrap items-center gap-2">
                      <span class="font-semibold">{{ notification.title }}</span>
                      @if (!notification.isRead) {
                        <span
                          class="h-2 w-2 rounded-full bg-accent"
                          [attr.aria-label]="i18n.t('notifications.unreadLabel')"
                        ></span>
                      }
                    </span>
                    @if (notification.message) {
                      <span class="mt-1 block text-sm text-muted">
                        {{ notification.message }}
                      </span>
                    }
                    <span class="mt-2 block text-[10px] text-muted">
                      {{ formatCreatedAt(notification.createdAt) }}
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  (click)="deleteNotification(notification)"
                  class="rounded-lg border border-border px-2 py-1 text-muted"
                  [attr.aria-label]="i18n.t('notifications.delete')"
                >
                  ×
                </button>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `,
})
export class NotificationsPage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  protected readonly i18n = inject(I18nService);
  protected readonly SSE_LABEL_KEYS = SSE_LABEL_KEYS;
  protected readonly store = inject(NotificationsStore);
  protected readonly push = inject(PushService);

  ngOnInit(): void {
    this.store.start();
    void this.push.load();
  }

  protected unreadLabel(): string {
    return this.store.unreadCount()
      ? this.i18n.t('notifications.unread', { count: this.store.unreadCount() })
      : this.i18n.t('notifications.allRead');
  }

  protected pushLabel(): string {
    if (!this.push.supported) return this.i18n.t('push.unsupported');
    if (!this.push.available()) return this.i18n.t('push.unavailable');
    return this.push.subscribed()
      ? this.i18n.t('push.subscribed')
      : this.i18n.t('push.notSubscribed');
  }

  protected formatCreatedAt(value: string): string {
    return formatDateTime(value, this.i18n.locale());
  }

  protected notificationCardClass(isRead: boolean): string {
    return `rounded-2xl border bg-surface p-4 transition ${
      isRead ? 'border-border' : 'border-accent/40'
    }`;
  }

  protected async openNotification(notification: AppNotification): Promise<void> {
    try {
      if (!notification.isRead) {
        await firstValueFrom(this.store.markRead(notification.id));
      }
      if (notification.type === 'username_changed') {
        this.auth.refreshProfile().subscribe({ error: () => undefined });
      }
    } catch {
      this.toast.error(this.i18n.t('notifications.openError'));
      return;
    }

    const url = notification.data?.url;
    if (url) void this.router.navigateByUrl(url);
  }

  protected deleteNotification(notification: AppNotification): void {
    this.store.remove(notification.id).subscribe({
      next: () => this.toast.success(this.i18n.t('notifications.deleted')),
      error: () => this.toast.error(this.i18n.t('notifications.deleteError')),
    });
  }

  protected markAllRead(): void {
    this.store.markAllRead().subscribe({
      next: () => this.toast.success(this.i18n.t('notifications.markedAll')),
      error: () => this.toast.error(this.i18n.t('notifications.markAllError')),
    });
  }

  protected togglePush(): void {
    if (this.push.subscribed()) void this.push.unsubscribe();
    else void this.push.subscribe();
  }
}
