import { Injectable, NgZone, inject, signal } from '@angular/core';
import { Subject, firstValueFrom } from 'rxjs';
import { ApiService } from '../api/api.service';
import type { NotificationEventPayload } from '../api/models/notification.model';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../../environments/environment';

export type SseStatus = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'polling';

interface TicketResponse {
  status: 'success';
  ticket: string;
  expiresIn: number;
}

const POLL_MS = 20_000;
const MAX_FAILURES = 2;

@Injectable({ providedIn: 'root' })
export class SseService {
  private readonly zone = inject(NgZone);
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);

  readonly status = signal<SseStatus>('idle');
  readonly events = new Subject<NotificationEventPayload | null>();

  private source: EventSource | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private onPoll: (() => void) | null = null;
  private failures = 0;
  private closed = true;
  private running = false;

  start(onPoll: () => void): void {
    if (this.running) return;
    if (!this.auth.getToken()) {
      this.status.set('idle');
      return;
    }

    this.running = true;
    this.closed = false;
    this.onPoll = onPoll;
    this.failures = 0;

    if (!('EventSource' in window)) {
      this.startPolling();
      return;
    }

    void this.connect();
    window.addEventListener('online', this.handleOnline);
  }

  stop(): void {
    this.closed = true;
    this.running = false;
    this.onPoll = null;
    this.source?.close();
    this.source = null;
    this.clearReconnect();
    this.stopPolling();
    window.removeEventListener('online', this.handleOnline);
    this.status.set('idle');
  }

  private readonly handleOnline = (): void => {
    if (this.closed) return;
    this.failures = 0;
    this.stopPolling();
    if (!this.source) void this.connect();
  };

  private readonly handleNotification = (event: MessageEvent<string>): void => {
    let payload: NotificationEventPayload | null = null;

    try {
      payload = JSON.parse(event.data) as NotificationEventPayload;
    } catch {
      payload = null;
    }

    this.zone.run(() => this.events.next(payload));
  };

  private async connect(): Promise<void> {
    if (this.closed) return;

    this.status.set(this.status() === 'open' ? 'open' : 'connecting');

    try {
      const response = await firstValueFrom(this.api.post<TicketResponse>('/events/ticket'));

      if (this.closed) return;

      this.source = new EventSource(
        `${environment.apiUrl}/events/stream?ticket=${encodeURIComponent(response.ticket)}`,
      );

      this.source.onopen = () => {
        this.zone.run(() => {
          this.failures = 0;
          this.stopPolling();
          this.status.set('open');
          this.onPoll?.();
        });
      };

      this.source.addEventListener('notification.created', (event) =>
        this.handleNotification(event as MessageEvent<string>),
      );

      this.source.onerror = () => {
        this.source?.close();
        this.source = null;

        if (this.closed) return;

        this.failures += 1;

        if (this.failures >= MAX_FAILURES) {
          this.startPolling();
          return;
        }

        this.zone.run(() => this.status.set('reconnecting'));
        this.reconnectTimer = setTimeout(() => void this.connect(), 3000);
      };
    } catch {
      if (this.closed) return;

      this.failures += 1;

      if (this.failures >= MAX_FAILURES) {
        this.startPolling();
        return;
      }

      this.zone.run(() => this.status.set('reconnecting'));
      this.reconnectTimer = setTimeout(() => void this.connect(), 3000);
    }
  }

  private startPolling(): void {
    if (this.pollTimer) return;

    this.zone.run(() => this.status.set('polling'));
    this.onPoll?.();
    this.pollTimer = setInterval(() => this.onPoll?.(), POLL_MS);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private clearReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
