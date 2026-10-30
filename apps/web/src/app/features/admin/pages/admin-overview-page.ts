import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../../../core/i18n/i18n.service';
import { CardComponent } from '../../../shared/ui/card.component';

@Component({
  selector: 'app-admin-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent],
  template: `
    <div class="grid gap-5">
      <header>
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-accent">
          {{ i18n.t('admin.eyebrow') }}
        </p>
        <h1 class="mt-1 text-2xl font-extrabold sm:text-3xl">{{ i18n.t('admin.title') }}</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {{ i18n.t('admin.description') }}
        </p>
      </header>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <app-card>
          <p class="text-xs font-semibold text-muted">{{ i18n.t('admin.usersActive') }}</p>
          <p class="mt-2 text-2xl font-extrabold">—</p>
        </app-card>
        <app-card>
          <p class="text-xs font-semibold text-muted">{{ i18n.t('admin.activeMatches') }}</p>
          <p class="mt-2 text-2xl font-extrabold">—</p>
        </app-card>
        <app-card>
          <p class="text-xs font-semibold text-muted">{{ i18n.t('admin.openReports') }}</p>
          <p class="mt-2 text-2xl font-extrabold">—</p>
        </app-card>
        <app-card>
          <p class="text-xs font-semibold text-muted">{{ i18n.t('admin.availableNow') }}</p>
          <p class="mt-2 text-2xl font-extrabold">—</p>
        </app-card>
      </div>

      <app-card>
        <h2 class="font-bold">{{ i18n.t('admin.apiTitle') }}</h2>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          {{ i18n.t('admin.apiDescriptionBefore') }}
          <code class="rounded bg-bg px-1 py-0.5 text-xs">GET /admin/overview</code>
          {{ i18n.t('admin.apiDescriptionAfter') }}
        </p>
      </app-card>
    </div>
  `,
})
export class AdminOverviewPage {
  protected readonly i18n = inject(I18nService);
}
