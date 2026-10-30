import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { I18nService } from '../../../core/i18n/i18n.service';
import { formatDate } from '../../../core/utils/time';
import { AuthShellComponent } from '../../../shared/layout/auth-shell.component';

@Component({
  selector: 'app-account-deleted-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AuthShellComponent],
  template: `
    <app-auth-shell
      [title]="i18n.t('accountDeleted.title')"
      [subtitle]="i18n.t('accountDeleted.subtitle')"
    >
      <div class="grid gap-4 text-sm leading-relaxed text-muted">
        <div class="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger/5 p-4">
          <span class="shrink-0 text-lg text-danger" aria-hidden="true">!</span>
          <p>
            {{ i18n.t('accountDeleted.dateInfo') }}
            <strong class="text-text">{{ scheduledLabel() }}</strong>
            .
          </p>
        </div>

        <p>{{ i18n.t('accountDeleted.info1') }}</p>
        <p class="rounded-xl border border-border bg-bg px-4 py-3 text-xs">
          {{ i18n.t('accountDeleted.info2') }}
        </p>

        <div class="flex flex-col gap-2 sm:flex-row">
          <a
            routerLink="/login"
            class="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-accent px-4 text-sm font-bold text-bg"
          >
            {{ i18n.t('accountDeleted.recover') }}
          </a>
          <a
            routerLink="/"
            class="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-border px-4 text-sm font-semibold text-muted"
          >
            {{ i18n.t('accountDeleted.home') }}
          </a>
        </div>
      </div>
    </app-auth-shell>
  `,
})
export class AccountDeletedPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  protected readonly scheduledLabel = computed(() => {
    const scheduled = this.route.snapshot.queryParamMap.get('scheduledFor');
    return scheduled ? formatDate(scheduled) : this.i18n.t('accountDeleted.defaultDate');
  });
}
