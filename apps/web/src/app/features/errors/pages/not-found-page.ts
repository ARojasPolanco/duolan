import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ButtonComponent } from '../../../shared/ui/button.component';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent],
  template: `
    <main class="flex min-h-screen items-center justify-center bg-bg px-5 text-text">
      <div class="max-w-md text-center">
        <p class="text-6xl font-extrabold tracking-tight text-accent">404</p>
        <h1 class="mt-3 text-2xl font-bold">{{ i18n.t('notFound.title') }}</h1>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          {{ i18n.t('notFound.description') }}
        </p>
        <div class="mt-6 flex justify-center gap-2">
          <app-button routerLink="/">{{ i18n.t('common.backHome') }}</app-button>
          <app-button variant="secondary" routerLink="/inicio">
            {{ i18n.t('notFound.app') }}
          </app-button>
        </div>
      </div>
    </main>
  `,
})
export class NotFoundPage {
  protected readonly i18n = inject(I18nService);
}
