import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  private nextId = 1;

  readonly toasts = this._toasts.asReadonly();

  show(message: string, tone: ToastTone = 'info', durationMs = 4000): number {
    const id = this.nextId++;
    this._toasts.update((current) => [...current.slice(-3), { id, message, tone }]);

    if (durationMs > 0) {
      setTimeout(() => this.dismiss(id), durationMs);
    }

    return id;
  }

  success(message: string, durationMs = 4000): number {
    return this.show(message, 'success', durationMs);
  }

  error(message: string, durationMs = 6000): number {
    return this.show(message, 'error', durationMs);
  }

  info(message: string, durationMs = 4000): number {
    return this.show(message, 'info', durationMs);
  }

  dismiss(id: number): void {
    this._toasts.update((current) => current.filter((toast) => toast.id !== id));
  }
}
