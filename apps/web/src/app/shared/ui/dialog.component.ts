import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <button
          type="button"
          class="absolute inset-0 bg-black/70 backdrop-blur-sm"
          (click)="closed.emit()"
          [attr.aria-label]="i18n.t('common.close')"
        ></button>
        <div
          class="relative z-10 w-full max-w-md rounded-t-2xl border border-border bg-surface p-5 shadow-2xl sm:rounded-2xl"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="title()"
        >
          <div class="mb-4 flex items-start justify-between gap-3">
            <h2 class="text-lg font-bold">{{ title() }}</h2>
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-text"
              (click)="closed.emit()"
              [attr.aria-label]="i18n.t('common.close')"
            >
              &times;
            </button>
          </div>
          <ng-content />
        </div>
      </div>
    }
  `,
})
export class DialogComponent {
  protected readonly i18n = inject(I18nService);

  readonly open = input(false);
  readonly title = input('');
  readonly closed = output<void>();
}
