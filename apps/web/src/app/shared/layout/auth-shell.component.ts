import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import { BetaBadgeComponent } from '../icons/beta-badge.component';
import { RiotDisclaimerComponent } from '../legal/riot-disclaimer.component';
import { LanguageToggleComponent } from '../ui/language-toggle.component';

@Component({
  selector: 'app-auth-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BetaBadgeComponent, RiotDisclaimerComponent, LanguageToggleComponent],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-bg px-5 py-10 text-text">
      <div class="w-full max-w-md">
        <div class="mb-8 flex items-center justify-between gap-3">
          <a
            routerLink="/"
            class="flex min-h-11 w-fit items-center gap-2 text-2xl font-extrabold tracking-tight"
          >
            Duo<span class="text-accent">LAN</span>
            <app-beta-badge />
          </a>
          <app-language-toggle />
        </div>

        <div
          class="rounded-2xl border border-border bg-surface p-6 shadow-2xl shadow-black/20 sm:p-8"
        >
          <h1 class="text-2xl font-bold">{{ title() }}</h1>
          @if (subtitle()) {
            <p class="mt-2 text-sm leading-relaxed text-muted">{{ subtitle() }}</p>
          }
          <div class="mt-6">
            <ng-content />
          </div>
        </div>

        <div class="mt-6 text-center text-sm text-muted">
          <ng-content select="[footer]" />
        </div>

        <nav
          class="mt-4 flex flex-wrap justify-center gap-x-4 text-[11px] font-semibold text-muted"
        >
          <a routerLink="/terminos" class="inline-flex min-h-11 items-center hover:text-text">
            {{ i18n.t('common.terms') }}
          </a>
          <a routerLink="/privacidad" class="inline-flex min-h-11 items-center hover:text-text">
            {{ i18n.t('common.privacy') }}
          </a>
          <a routerLink="/aviso-riot" class="inline-flex min-h-11 items-center hover:text-text">
            {{ i18n.t('common.riotNotice') }}
          </a>
        </nav>
        <app-riot-disclaimer class="mt-2 block text-center" />
      </div>
    </div>
  `,
})
export class AuthShellComponent {
  protected readonly i18n = inject(I18nService);
  readonly title = input.required<string>();
  readonly subtitle = input('');
}
