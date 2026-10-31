import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import type { TranslationKey } from '../../../core/i18n/translations';
import { BetaBadgeComponent } from '../../../shared/icons/beta-badge.component';
import { RiotDisclaimerComponent } from '../../../shared/legal/riot-disclaimer.component';
import { LanguageToggleComponent } from '../../../shared/ui/language-toggle.component';

interface GuideMode {
  number: string;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
}

const MODES: GuideMode[] = [
  { number: '01', titleKey: 'how.matchTitle', bodyKey: 'how.matchBody' },
  { number: '02', titleKey: 'how.availableTitle', bodyKey: 'how.availableBody' },
  { number: '03', titleKey: 'how.postsTitle', bodyKey: 'how.postsBody' },
];

const STEPS: TranslationKey[] = ['how.step1', 'how.step2', 'how.step3', 'how.step4'];

@Component({
  selector: 'app-how-it-works-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BetaBadgeComponent, RiotDisclaimerComponent, LanguageToggleComponent],
  template: `
    <main class="min-h-screen bg-bg text-text">
      <header class="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-5">
        <a routerLink="/" class="flex min-h-11 items-center gap-2 text-xl font-extrabold">
          Duo<span class="text-accent">LAN</span>
          <app-beta-badge />
        </a>
        <div class="flex items-center gap-2 text-sm font-semibold">
          <app-language-toggle />
          @if (isAuthenticated()) {
            <a
              routerLink="/inicio"
              class="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-xs font-bold"
            >
              {{ i18n.t('common.goToApp') }}
            </a>
          } @else {
            <a routerLink="/login" class="inline-flex min-h-11 items-center px-2 text-muted">
              {{ i18n.t('common.login') }}
            </a>
            <a
              routerLink="/register"
              class="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-xs font-bold text-bg"
            >
              {{ i18n.t('common.register') }}
            </a>
          }
        </div>
      </header>

      <div class="mx-auto max-w-5xl px-5 pb-16">
        <section
          class="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-10 sm:px-10 sm:py-14"
        >
          <div
            class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
          ></div>
          <div class="relative max-w-3xl">
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              {{ i18n.t('landing.howEyebrow') }}
            </p>
            <h1 class="mt-3 text-3xl font-extrabold leading-tight sm:text-5xl">
              {{ i18n.t('how.title') }}
            </h1>
            <p class="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {{ i18n.t('how.subtitle') }}
            </p>
            <div class="mt-6 flex flex-wrap gap-2 text-xs font-semibold text-muted">
              <span class="rounded-full border border-border px-3 py-1.5">
                {{ i18n.t('landing.soloLan') }}
              </span>
              <span class="rounded-full border border-border px-3 py-1.5">
                {{ i18n.t('landing.adults') }}
              </span>
              <span
                class="rounded-full border border-accent/40 bg-accent/10 px-3 py-1.5 text-accent"
              >
                {{ i18n.t('landing.openBeta') }}
              </span>
            </div>
          </div>
        </section>

        <section class="mt-8 rounded-2xl border border-gold/40 bg-gold/10 p-5 sm:p-6">
          <div class="flex items-start gap-3">
            <span
              class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-sm font-extrabold text-gold"
            >
              F
            </span>
            <div>
              <h2 class="text-lg font-bold text-gold">{{ i18n.t('how.flexTitle') }}</h2>
              <p class="mt-1 text-sm leading-relaxed text-muted">
                {{ i18n.t('how.flexBody') }}
              </p>
            </div>
          </div>
        </section>

        <section class="mt-12">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {{ i18n.t('landing.howEyebrow') }}
          </p>
          <h2 class="mt-2 text-2xl font-extrabold sm:text-3xl">
            {{ i18n.t('landing.howTitle') }}
          </h2>
          <div class="mt-5 grid gap-4 md:grid-cols-3">
            @for (mode of modes; track mode.number) {
              <article class="rounded-2xl border border-border bg-surface p-5">
                <p class="text-xs font-extrabold tracking-[0.2em] text-accent">
                  {{ mode.number }}
                </p>
                <h3 class="mt-3 text-lg font-bold">{{ i18n.t(mode.titleKey) }}</h3>
                <p class="mt-2 text-sm leading-relaxed text-muted">
                  {{ i18n.t(mode.bodyKey) }}
                </p>
              </article>
            }
          </div>
        </section>

        <section class="mt-12 rounded-3xl border border-border bg-surface p-6 sm:p-8">
          <h2 class="text-2xl font-extrabold">{{ i18n.t('how.flowTitle') }}</h2>
          <div class="mt-5 grid gap-4 sm:grid-cols-2">
            @for (step of steps; track step; let index = $index) {
              <article class="rounded-2xl border border-border bg-bg p-5">
                <p class="text-xs font-extrabold tracking-[0.2em] text-accent">
                  {{ (index + 1).toString().padStart(2, '0') }}
                </p>
                <p class="mt-2 text-sm leading-relaxed text-muted">{{ i18n.t(step) }}</p>
              </article>
            }
          </div>
        </section>

        <section class="mt-8 rounded-3xl border border-gold/40 bg-gold/10 p-6 sm:p-8">
          <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div class="max-w-2xl">
              <h2 class="text-2xl font-extrabold text-gold">{{ i18n.t('how.aramTitle') }}</h2>
              <p class="mt-2 text-sm leading-relaxed text-muted">{{ i18n.t('how.aramBody') }}</p>
            </div>
            <a
              routerLink="/aram"
              class="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl border border-gold/50 px-5 py-3 text-sm font-bold text-gold"
            >
              {{ i18n.t('common.aram') }}
            </a>
          </div>
        </section>

        <section class="mt-12 grid gap-4 lg:grid-cols-2">
          <article class="rounded-2xl border border-border bg-surface p-6">
            <h2 class="text-xl font-bold text-accent">{{ i18n.t('how.pushTitle') }}</h2>
            <p class="mt-2 text-sm leading-relaxed text-muted">{{ i18n.t('how.pushBody') }}</p>
          </article>
          <article class="rounded-2xl border border-border bg-surface p-6">
            <h2 class="text-xl font-bold text-accent">{{ i18n.t('how.privacyTitle') }}</h2>
            <p class="mt-2 text-sm leading-relaxed text-muted">{{ i18n.t('how.privacyBody') }}</p>
          </article>
        </section>

        <section class="mt-12 rounded-3xl border border-accent/40 bg-accent/10 p-6 sm:p-8">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-2xl font-extrabold">{{ i18n.t('how.finalTitle') }}</h2>
              <p class="mt-2 text-sm leading-relaxed text-muted">{{ i18n.t('how.finalBody') }}</p>
            </div>
            <a
              [routerLink]="isAuthenticated() ? '/inicio' : '/register'"
              class="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-bold text-bg"
            >
              {{ isAuthenticated() ? i18n.t('common.goToApp') : i18n.t('how.cta') }}
            </a>
          </div>
        </section>
      </div>

      <footer class="border-t border-border px-5 py-6">
        <div class="mx-auto max-w-5xl space-y-3 text-xs text-muted">
          <div class="flex flex-wrap items-center gap-x-4">
            <a routerLink="/terminos" class="inline-flex min-h-11 items-center hover:text-text">
              {{ i18n.t('common.terms') }}
            </a>
            <a routerLink="/privacidad" class="inline-flex min-h-11 items-center hover:text-text">
              {{ i18n.t('common.privacy') }}
            </a>
            <a routerLink="/aviso-riot" class="inline-flex min-h-11 items-center hover:text-text">
              {{ i18n.t('common.riotNotice') }}
            </a>
          </div>
          <app-riot-disclaimer class="block" />
          <p>{{ i18n.t('common.betaNotice') }}</p>
        </div>
      </footer>
    </main>
  `,
})
export class HowItWorksPage {
  private readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);
  protected readonly isAuthenticated = computed(() => this.auth.isAuthenticated());
  protected readonly modes = MODES;
  protected readonly steps = STEPS;
}
