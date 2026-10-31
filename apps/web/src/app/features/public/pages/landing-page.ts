import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { PublicProfile } from '../../../core/api/models/profile.model';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { PlayerPreviewCardComponent } from '../../../shared/cards/player-preview-card.component';
import { BetaBadgeComponent } from '../../../shared/icons/beta-badge.component';
import { HowItWorksCarouselComponent } from '../../../shared/public/how-it-works-carousel.component';
import { RiotDisclaimerComponent } from '../../../shared/legal/riot-disclaimer.component';
import { LanguageToggleComponent } from '../../../shared/ui/language-toggle.component';

interface PreviewPlayer {
  profile: PublicProfile;
  score: number;
  reasons: string[];
}

const PREVIEW_PLAYERS: PreviewPlayer[] = [
  {
    profile: {
      id: 'demo-card-mid',
      username: 'MidOrDodge',
      country: 'MX',
      primaryRole: 'mid',
      secondaryRole: 'jungle',
      rankTier: 'diamond',
      rankDivision: 'ii',
      rankLp: 43,
      rankSource: 'declared',
      flexRankTier: null,
      flexRankDivision: null,
      flexRankLp: null,
      flexRankSource: 'declared',
      playStyle: 'ranked',
      languages: ['es', 'en'],
      hasMic: true,
      scheduleBlocks: ['mon_night', 'tue_night'],
      bio: 'Mid main. Busco duo para ranked con horarios de noche.',
      reputation: { score: 92, positive: 18, negative: 1, total: 19, label: '92%' },
      availabilityActive: false,
    },
    score: 94,
    reasons: ['Coinciden 5 horarios', 'Mismo estilo', 'Roles complementarios'],
  },
  {
    profile: {
      id: 'demo-card-jungle',
      username: 'JungleTrack',
      country: 'CO',
      primaryRole: 'jungle',
      secondaryRole: 'top',
      rankTier: 'diamond',
      rankDivision: 'iii',
      rankLp: 12,
      rankSource: 'declared',
      flexRankTier: null,
      flexRankDivision: null,
      flexRankLp: null,
      flexRankSource: 'declared',
      playStyle: 'ranked',
      languages: ['es'],
      hasMic: true,
      scheduleBlocks: ['wed_night', 'thu_night'],
      bio: 'Jungla main, prefiero comunicar por voz.',
      reputation: { score: 88, positive: 12, negative: 1, total: 13, label: '88%' },
      availabilityActive: false,
    },
    score: 91,
    reasons: ['Mismo rango', 'Roles complementarios', 'Ambos con micrófono'],
  },
  {
    profile: {
      id: 'demo-card-support',
      username: 'SupportCarry',
      country: 'PE',
      primaryRole: 'support',
      secondaryRole: 'adc',
      rankTier: 'platinum',
      rankDivision: 'i',
      rankLp: 72,
      rankSource: 'declared',
      flexRankTier: null,
      flexRankDivision: null,
      flexRankLp: null,
      flexRankSource: 'declared',
      playStyle: 'casual',
      languages: ['es', 'pt'],
      hasMic: true,
      scheduleBlocks: ['fri_night', 'sat_night'],
      bio: 'Support main, juego para mejorar sin toxicidad.',
      reputation: { score: 0, positive: 0, negative: 0, total: 0, label: 'Nuevo' },
      availabilityActive: true,
    },
    score: 86,
    reasons: ['Horarios compatibles', 'Roles complementarios', 'Comparten idioma'],
  },
];

@Component({
  selector: 'app-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    BetaBadgeComponent,
    RiotDisclaimerComponent,
    LanguageToggleComponent,
    HowItWorksCarouselComponent,
    PlayerPreviewCardComponent,
  ],
  template: `
    <main class="min-h-screen bg-bg text-text">
      <header class="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <a routerLink="/" class="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          Duo<span class="text-accent">LAN</span>
          <app-beta-badge />
        </a>
        <div class="flex items-center gap-2 text-sm font-semibold">
          <app-language-toggle />
          @if (isAuthenticated()) {
            <a
              routerLink="/inicio"
              class="inline-flex min-h-11 items-center rounded-lg bg-accent px-3 text-[11px] font-bold text-bg sm:px-4 sm:text-xs"
            >
              {{ i18n.t('common.goToApp') }}
            </a>
          } @else {
            <a
              routerLink="/login"
              class="inline-flex min-h-11 items-center px-2 text-xs text-muted sm:text-sm"
            >
              {{ i18n.t('common.login') }}
            </a>
            <a
              routerLink="/register"
              class="inline-flex min-h-11 items-center rounded-lg bg-accent px-3 text-[11px] font-bold text-bg sm:px-4 sm:text-xs"
            >
              {{ i18n.t('common.register') }}
            </a>
          }
        </div>
      </header>

      <div class="mx-auto max-w-6xl px-5 pb-16">
        <section
          class="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-10 sm:px-10 sm:py-16"
        >
          <div
            class="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
          ></div>
          <div
            class="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-gold/10 blur-3xl"
          ></div>

          <div class="relative max-w-3xl">
            <p class="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              League of Legends &middot; LAN
            </p>
            <h1 class="text-4xl font-extrabold leading-tight sm:text-6xl">
              {{ i18n.t('landing.heroTitleBefore') }}<span class="text-accent">LAN</span
              >{{ i18n.t('landing.heroTitleAfter') }}
            </h1>
            <p class="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              {{ i18n.t('landing.heroDescription') }}
            </p>
            <p class="mt-3 text-xs font-semibold text-accent">
              {{ i18n.t('landing.heroNote') }}
            </p>

            <div class="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                routerLink="/register"
                class="rounded-xl bg-accent px-6 py-3.5 text-center text-sm font-bold text-bg transition hover:bg-accent-strong"
              >
                {{ i18n.t('common.register') }}
              </a>
              <a
                routerLink="/login"
                class="rounded-xl border border-border bg-bg px-6 py-3.5 text-center text-sm font-bold text-text transition hover:border-accent"
              >
                {{ i18n.t('landing.alreadyHaveAccount') }}
              </a>
            </div>

            <div class="mt-8 flex flex-wrap gap-2 text-xs font-semibold text-muted">
              <span class="rounded-full border border-border px-3 py-1">
                {{ i18n.t('landing.soloLan') }}
              </span>
              <span class="rounded-full border border-border px-3 py-1">
                {{ i18n.t('landing.adults') }}
              </span>
              <span class="rounded-full border border-border px-3 py-1">
                {{ i18n.t('landing.contactOnlyMatch') }}
              </span>
            </div>
          </div>
        </section>

        <section class="mt-10">
          <div class="mb-4 flex items-end justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {{ i18n.t('landing.howEyebrow') }}
              </p>
              <h2 class="mt-2 text-2xl font-extrabold sm:text-3xl">
                {{ i18n.t('landing.howTitle') }}
              </h2>
            </div>
            <a
              routerLink="/como-funciona"
              class="inline-flex min-h-11 items-center text-sm font-semibold text-accent hover:underline"
            >
              {{ i18n.t('landing.howCta') }}
            </a>
          </div>
          <app-how-it-works-carousel />
        </section>

        <section class="mt-14">
          <div class="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {{ i18n.t('landing.previewEyebrow') }}
              </p>
              <h2 class="mt-2 text-2xl font-extrabold sm:text-3xl">
                {{ i18n.t('landing.previewTitle') }}
              </h2>
              <p class="mt-2 max-w-2xl text-sm text-muted">
                {{ i18n.t('landing.previewBody') }}
              </p>
            </div>
            <a
              routerLink="/register"
              class="rounded-xl bg-accent px-5 py-3 text-sm font-bold text-bg"
            >
              {{ i18n.t('landing.previewCta') }}
            </a>
          </div>

          <div class="grid gap-4 md:grid-cols-3">
            @for (player of previewPlayers; track player.profile.id) {
              <app-player-preview-card
                [player]="player.profile"
                [score]="player.score"
                [reasons]="player.reasons"
                [showActions]="false"
              />
            }
          </div>
        </section>

        <section class="mt-14 grid gap-4 sm:grid-cols-3">
          <article class="rounded-2xl border border-border bg-surface p-6">
            <div
              class="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2 text-sm font-extrabold text-accent"
            >
              01
            </div>
            <h2 class="text-base font-bold">{{ i18n.t('landing.matchTitle') }}</h2>
            <p class="mt-2 text-sm leading-relaxed text-muted">
              {{ i18n.t('landing.matchDescription') }}
            </p>
          </article>
          <article class="rounded-2xl border border-border bg-surface p-6">
            <div
              class="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2 text-sm font-extrabold text-accent"
            >
              02
            </div>
            <h2 class="text-base font-bold">{{ i18n.t('landing.availabilityTitle') }}</h2>
            <p class="mt-2 text-sm leading-relaxed text-muted">
              {{ i18n.t('landing.availabilityDescription') }}
            </p>
          </article>
          <article class="rounded-2xl border border-border bg-surface p-6">
            <div
              class="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2 text-sm font-extrabold text-accent"
            >
              03
            </div>
            <h2 class="text-base font-bold">{{ i18n.t('landing.postsTitle') }}</h2>
            <p class="mt-2 text-sm leading-relaxed text-muted">
              {{ i18n.t('landing.postsDescription') }}
            </p>
          </article>
        </section>

        <section class="mt-14 rounded-3xl border border-border bg-surface p-6 sm:p-10">
          <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 class="text-2xl font-extrabold">{{ i18n.t('landing.finalTitle') }}</h2>
              <p class="mt-2 text-sm text-muted">{{ i18n.t('landing.finalBody') }}</p>
            </div>
            <a
              routerLink="/register"
              class="shrink-0 rounded-xl bg-accent px-6 py-3.5 text-center text-sm font-bold text-bg"
            >
              {{ i18n.t('landing.finalCta') }}
            </a>
          </div>
        </section>
      </div>

      <footer class="border-t border-border px-5 py-6">
        <div class="mx-auto max-w-6xl space-y-3 text-xs text-muted">
          <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span>&copy; {{ currentYear }} Duo LAN</span>
            <div class="flex flex-wrap items-center gap-x-4">
              <a routerLink="/como-funciona" class="inline-flex min-h-11 items-center">
                {{ i18n.t('common.howItWorks') }}
              </a>
              <a routerLink="/terminos" class="inline-flex min-h-11 items-center">
                {{ i18n.t('common.terms') }}
              </a>
              <a routerLink="/privacidad" class="inline-flex min-h-11 items-center">
                {{ i18n.t('common.privacy') }}
              </a>
              <a routerLink="/aviso-riot" class="inline-flex min-h-11 items-center">
                {{ i18n.t('common.riotNotice') }}
              </a>
            </div>
          </div>
          <app-riot-disclaimer class="block border-t border-border pt-3" />
          <p>{{ i18n.t('common.betaNotice') }}</p>
        </div>
      </footer>
    </main>
  `,
})
export class LandingPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);
  protected readonly isAuthenticated = computed(() => this.auth.isAuthenticated());
  protected readonly previewPlayers = PREVIEW_PLAYERS;
  protected readonly currentYear = new Date().getFullYear();

  constructor() {
    if (this.auth.isAuthenticated()) {
      void this.router.navigate([this.auth.isAdmin() ? '/admin' : '/inicio'], {
        replaceUrl: true,
      });
    }
  }
}
