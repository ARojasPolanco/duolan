import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { BetaBadgeComponent } from '../../../shared/icons/beta-badge.component';
import { RiotDisclaimerComponent } from '../../../shared/legal/riot-disclaimer.component';
import { LanguageToggleComponent } from '../../../shared/ui/language-toggle.component';

@Component({
  selector: 'app-how-it-works-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BetaBadgeComponent, RiotDisclaimerComponent, LanguageToggleComponent],
  template: `
    <main class="mx-auto max-w-5xl px-5 py-8 sm:px-8">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <a routerLink="/" class="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          Duo<span class="text-accent">LAN</span>
          <app-beta-badge />
        </a>
        <div class="flex items-center gap-2">
          <app-language-toggle />
          @if (isAuthenticated()) {
            <a
              routerLink="/inicio"
              class="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 text-xs font-bold text-bg"
            >
              {{ i18n.t('common.goToApp') }}
            </a>
          } @else {
            <a
              routerLink="/login"
              class="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-xs font-semibold text-muted"
            >
              {{ i18n.t('common.login') }}
            </a>
          }
        </div>
      </header>

      <section class="mt-10 max-w-3xl">
        <p class="text-xs font-bold uppercase tracking-[0.2em] text-accent">Duo LAN</p>
        <h1 class="mt-2 text-3xl font-extrabold sm:text-5xl">{{ i18n.t('how.title') }}</h1>
        <p class="mt-4 text-base leading-relaxed text-muted">{{ i18n.t('how.subtitle') }}</p>
      </section>

      <div class="mt-8 grid gap-4 sm:grid-cols-2">
        <article class="rounded-2xl border border-border bg-surface p-5">
          <h2 class="font-bold text-accent">{{ i18n.t('how.matchTitle') }}</h2>
          <p class="mt-2 text-sm leading-relaxed text-muted">{{ i18n.t('how.matchBody') }}</p>
        </article>
        <article class="rounded-2xl border border-border bg-surface p-5">
          <h2 class="font-bold text-accent">{{ i18n.t('how.availableTitle') }}</h2>
          <p class="mt-2 text-sm leading-relaxed text-muted">{{ i18n.t('how.availableBody') }}</p>
        </article>
        <article class="rounded-2xl border border-border bg-surface p-5">
          <h2 class="font-bold text-accent">{{ i18n.t('how.postsTitle') }}</h2>
          <p class="mt-2 text-sm leading-relaxed text-muted">{{ i18n.t('how.postsBody') }}</p>
        </article>
        <article class="rounded-2xl border border-border bg-surface p-5">
          <h2 class="font-bold text-accent">{{ i18n.t('how.aramTitle') }}</h2>
          <p class="mt-2 text-sm leading-relaxed text-muted">{{ i18n.t('how.aramBody') }}</p>
        </article>
      </div>

      <section class="mt-10 rounded-2xl border border-border bg-surface p-6">
        <h2 class="text-xl font-bold">{{ i18n.t('how.flowTitle') }}</h2>
        <ol class="mt-4 grid gap-3 text-sm leading-relaxed text-muted">
          <li class="flex gap-3">
            <span class="font-bold text-accent">1.</span>{{ i18n.t('how.step1') }}
          </li>
          <li class="flex gap-3">
            <span class="font-bold text-accent">2.</span>{{ i18n.t('how.step2') }}
          </li>
          <li class="flex gap-3">
            <span class="font-bold text-accent">3.</span>{{ i18n.t('how.step3') }}
          </li>
          <li class="flex gap-3">
            <span class="font-bold text-accent">4.</span>{{ i18n.t('how.step4') }}
          </li>
        </ol>
      </section>

      <section class="mt-6 rounded-2xl border border-border bg-surface p-6">
        <h2 class="text-xl font-bold">{{ i18n.t('how.pushTitle') }}</h2>
        <p class="mt-2 text-sm leading-relaxed text-muted">{{ i18n.t('how.pushBody') }}</p>
      </section>

      <div class="mt-8 flex flex-wrap gap-3">
        <a
          routerLink="/register"
          class="inline-flex min-h-11 items-center rounded-xl bg-accent px-5 text-sm font-bold text-bg"
        >
          {{ i18n.t('how.cta') }}
        </a>
        <a
          routerLink="/login"
          class="inline-flex min-h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold text-muted"
        >
          {{ i18n.t('how.haveAccount') }}
        </a>
      </div>

      <footer class="mt-10 border-t border-border pt-4">
        <nav class="flex flex-wrap gap-x-4 text-[11px] font-semibold text-muted">
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
        <app-riot-disclaimer class="mt-2 block max-w-4xl" />
      </footer>
    </main>
  `,
})
export class HowItWorksPage {
  private readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);
  protected readonly isAuthenticated = computed(() => this.auth.isAuthenticated());
}
