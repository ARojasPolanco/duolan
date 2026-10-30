import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ButtonComponent } from '../../../shared/ui/button.component';

@Component({
  selector: 'app-error-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent],
  template: `
    <main class="flex min-h-screen items-center justify-center bg-bg px-5 text-text">
      <div class="max-w-md text-center">
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-danger">
          {{ i18n.t('error.eyebrow') }}
        </p>
        <h1 class="mt-3 text-2xl font-bold">{{ i18n.t('error.title') }}</h1>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          {{ i18n.t('error.description') }}
        </p>
        <div class="mt-6 flex justify-center gap-2">
          <app-button (click)="reload()">{{ i18n.t('error.reload') }}</app-button>
          <app-button variant="secondary" routerLink="/">
            {{ i18n.t('common.backHome') }}
          </app-button>
        </div>
      </div>
    </main>
  `,
})
export class ErrorPage {
  protected readonly i18n = inject(I18nService);

  protected reload(): void {
    window.location.reload();
  }
}
