import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService, type ToastTone } from './toast.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-center gap-2 sm:left-auto sm:right-6 sm:top-6 sm:items-end"
      aria-live="polite"
      aria-atomic="false"
    >
      @for (toast of toasts(); track toast.id) {
        <div
          class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-2xl shadow-black/40"
          [class]="toneClass(toast.tone)"
          role="status"
        >
          <span class="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-current" aria-hidden="true"></span>
          <p class="min-w-0 flex-1 leading-relaxed">{{ toast.message }}</p>
          <button
            type="button"
            class="-mr-1 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-current opacity-70 transition hover:opacity-100"
            (click)="toastService.dismiss(toast.id)"
            aria-label="Cerrar aviso"
          >
            ×
          </button>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
  protected readonly toasts = this.toastService.toasts;

  protected toneClass(tone: ToastTone): string {
    switch (tone) {
      case 'success':
        return 'border-success/40 bg-surface text-success';
      case 'error':
        return 'border-danger/40 bg-surface text-danger';
      default:
        return 'border-border bg-surface text-text';
    }
  }
}
