import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { BetaBadgeComponent } from '../../../shared/icons/beta-badge.component';
import { RiotDisclaimerComponent } from '../../../shared/legal/riot-disclaimer.component';
import { LanguageToggleComponent } from '../../../shared/ui/language-toggle.component';

@Component({
  selector: 'app-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BetaBadgeComponent, RiotDisclaimerComponent, LanguageToggleComponent],
  template: `
    <main class="mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-8 sm:px-8">
      <header class="flex items-center justify-between gap-4">
        <a routerLink="/" class="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          Duo<span class="text-accent">LAN</span>
          <app-beta-badge />
        </a>
        <div class="flex items-center gap-2">
          <app-language-toggle />
          @if (isAuthenticated()) {
            <a
              routerLink="/inicio"
              class="rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-bg transition hover:bg-accent-strong"
            >
              {{ i18n.t('common.goToApp') }}
            </a>
          } @else {
            <a
              routerLink="/login"
              class="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-text transition hover:border-accent/60"
            >
              {{ i18n.t('common.login') }}
            </a>
          }
        </div>
      </header>

      <section class="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <p
          class="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-accent"
        >
          {{ i18n.t('landing.openBeta') }}
        </p>
        <h1 class="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          {{ i18n.t('landing.heroTitleBefore') }}<span class="text-accent">LAN</span
          >{{ i18n.t('landing.heroTitleAfter') }}
        </h1>
        <p class="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          {{ i18n.t('landing.heroDescription') }}
        </p>

        <div class="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            routerLink="/register"
            class="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-bold text-bg transition hover:bg-accent-strong"
          >
            {{ i18n.t('common.register') }}
          </a>
          <a
            routerLink="/login"
            class="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-bold text-text transition hover:border-accent/60"
          >
            {{ i18n.t('landing.alreadyHaveAccount') }}
          </a>
        </div>

        <div class="mt-12 grid w-full gap-3 text-left sm:grid-cols-3">
          <div class="rounded-2xl border border-border bg-surface p-5">
            <h2 class="text-sm font-bold text-accent">{{ i18n.t('landing.matchTitle') }}</h2>
            <p class="mt-2 text-xs leading-relaxed text-muted">
              {{ i18n.t('landing.matchDescription') }}
            </p>
          </div>
          <div class="rounded-2xl border border-border bg-surface p-5">
            <h2 class="text-sm font-bold text-accent">
              {{ i18n.t('landing.availabilityTitle') }}
            </h2>
            <p class="mt-2 text-xs leading-relaxed text-muted">
              {{ i18n.t('landing.availabilityDescription') }}
            </p>
          </div>
          <div class="rounded-2xl border border-border bg-surface p-5">
            <h2 class="text-sm font-bold text-accent">{{ i18n.t('landing.postsTitle') }}</h2>
            <p class="mt-2 text-xs leading-relaxed text-muted">
              {{ i18n.t('landing.postsDescription') }}
            </p>
          </div>
        </div>
      </section>

      <footer class="mt-8 border-t border-border pt-4">
        <nav class="flex flex-wrap gap-x-4 text-[11px] font-semibold text-muted">
          <a routerLink="/como-funciona" class="inline-flex min-h-11 items-center hover:text-text">
            {{ i18n.t('common.howItWorks') }}
          </a>
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
        <p class="mt-2 text-[11px] text-muted">{{ i18n.t('common.betaNotice') }}</p>
      </footer>
    </main>
  `,
})
export class LandingPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);
  protected readonly isAuthenticated = computed(() => this.auth.isAuthenticated());

  constructor() {
    if (this.auth.isAuthenticated()) {
      void this.router.navigate([this.auth.isAdmin() ? '/admin' : '/inicio'], {
        replaceUrl: true,
      });
    }
  }
}
