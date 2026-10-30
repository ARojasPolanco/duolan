import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import type { PublicProfile } from '../../../core/api/models/profile.model';
import { ProfilesService } from '../../../core/api/profiles.service';
import {
  DIVISION_LABEL_KEYS,
  LANGUAGE_LABEL_KEYS,
  RANK_LABEL_KEYS,
  ROLE_LABEL_KEYS,
  STYLE_LABEL_KEYS,
} from '../../../core/i18n/labels';
import { I18nService } from '../../../core/i18n/i18n.service';
import { formatDate } from '../../../core/utils/time';
import { CountryBadgeComponent } from '../../../shared/icons/country-badge.component';
import { RankIconComponent } from '../../../shared/icons/rank-icon.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';

@Component({
  selector: 'app-public-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CountryBadgeComponent, RankIconComponent, ButtonComponent, CardComponent],
  template: `
    <div class="grid gap-5">
      @if (loading()) {
        <div class="flex min-h-[40vh] items-center justify-center">
          <div
            class="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"
          ></div>
        </div>
      } @else if (error()) {
        <app-card padding="lg">
          <h1 class="text-xl font-bold">{{ i18n.t('publicProfile.notFound') }}</h1>
          <p class="mt-2 text-sm text-muted">{{ error() }}</p>
          <app-button class="mt-4" variant="secondary" routerLink="/inicio">
            {{ i18n.t('common.backHome') }}
          </app-button>
        </app-card>
      } @else if (profile(); as profile) {
        <app-card padding="lg">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {{ i18n.t('publicProfile.eyebrow') }}
          </p>
          <div class="mt-3 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 class="text-2xl font-extrabold">&#64;{{ profile.username }}</h1>
              @if (profile.country) {
                <p class="mt-1 text-xs text-muted">
                  <app-country-badge [country]="profile.country" />
                </p>
              }
              <p class="mt-2 flex items-center gap-2 text-sm text-muted">
                <app-rank-icon [tier]="profile.rankTier" [size]="22" />
                {{ rankLabel(profile) }} · {{ rolesLabel(profile) }}
              </p>
            </div>
            @if (profile.availabilityActive) {
              <span
                class="rounded-full border border-success/40 bg-success/10 px-3 py-1 text-xs font-bold text-success"
              >
                {{ i18n.t('publicProfile.availableNow') }}
              </span>
            }
          </div>

          <div class="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div class="rounded-xl border border-border bg-bg p-3">
              <p class="text-xs text-muted">{{ i18n.t('onboarding.summary.style') }}</p>
              <p class="mt-1 font-semibold">{{ styleLabel(profile) }}</p>
            </div>
            <div class="rounded-xl border border-border bg-bg p-3">
              <p class="text-xs text-muted">{{ i18n.t('onboarding.summary.languages') }}</p>
              <p class="mt-1 font-semibold">{{ languagesLabel(profile) }}</p>
            </div>
            <div class="rounded-xl border border-border bg-bg p-3">
              <p class="text-xs text-muted">{{ i18n.t('onboarding.summary.schedule') }}</p>
              <p class="mt-1 font-semibold">{{ profile.scheduleBlocks.length }}</p>
            </div>
            <div class="rounded-xl border border-border bg-bg p-3">
              <p class="text-xs text-muted">{{ i18n.t('onboarding.summary.mic') }}</p>
              <p class="mt-1 font-semibold">
                {{ profile.hasMic ? i18n.t('label.yes') : i18n.t('label.no') }}
              </p>
            </div>
            <div class="rounded-xl border border-border bg-bg p-3">
              <p class="text-xs text-muted">{{ i18n.t('publicProfile.connections') }}</p>
              <p class="mt-1 font-semibold">{{ profile.stats?.connections ?? 0 }}</p>
            </div>
            <div class="rounded-xl border border-border bg-bg p-3">
              <p class="text-xs text-muted">Reputación</p>
              <p class="mt-1 font-semibold">{{ profile.reputation.label || '—' }}</p>
            </div>
          </div>

          @if (profile.bio) {
            <p
              class="mt-5 rounded-xl border border-border bg-bg p-4 text-sm leading-relaxed text-muted"
            >
              {{ profile.bio }}
            </p>
          }

          @if (profile.createdAt) {
            <p class="mt-4 text-xs text-muted">
              {{ i18n.t('publicProfile.memberSince', { date: formatDate(profile.createdAt) }) }}
            </p>
          }

          <p class="mt-4 text-xs leading-relaxed text-muted">
            {{ i18n.t('publicProfile.contactHidden') }}
          </p>
        </app-card>

        <div>
          <app-button variant="secondary" routerLink="/inicio">
            {{ i18n.t('common.backHome') }}
          </app-button>
        </div>
      }
    </div>
  `,
})
export class PublicProfilePage implements OnInit {
  private readonly profiles = inject(ProfilesService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly i18n = inject(I18nService);
  protected readonly formatDate = formatDate;

  readonly id = input.required<string>();

  protected readonly profile = signal<PublicProfile | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  ngOnInit(): void {
    const id = this.id();
    this.profiles
      .getPublic(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.profile.set(response.profile);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(this.i18n.t('publicProfile.loadError'));
        },
      });
  }

  protected rankLabel(profile: PublicProfile): string {
    const tier = this.i18n.t(RANK_LABEL_KEYS[profile.rankTier]);
    const division = profile.rankDivision
      ? this.i18n.t(DIVISION_LABEL_KEYS[profile.rankDivision])
      : '';
    return division ? `${tier} ${division}` : tier;
  }

  protected rolesLabel(profile: PublicProfile): string {
    return `${this.i18n.t(ROLE_LABEL_KEYS[profile.primaryRole])} / ${this.i18n.t(
      ROLE_LABEL_KEYS[profile.secondaryRole],
    )}`;
  }

  protected styleLabel(profile: PublicProfile): string {
    return this.i18n.t(STYLE_LABEL_KEYS[profile.playStyle]);
  }

  protected languagesLabel(profile: PublicProfile): string {
    return profile.languages
      .map((language) => this.i18n.t(LANGUAGE_LABEL_KEYS[language]))
      .join(', ');
  }
}
