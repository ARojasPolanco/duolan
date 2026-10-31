import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import type { Queue, RankDivision, RankTier, Role } from '../../core/api/models/enums';
import type { PublicProfile } from '../../core/api/models/profile.model';
import {
  DIVISION_LABEL_KEYS,
  LANGUAGE_LABEL_KEYS,
  RANK_LABEL_KEYS,
  ROLE_LABEL_KEYS,
  STYLE_LABEL_KEYS,
} from '../../core/i18n/labels';
import { I18nService } from '../../core/i18n/i18n.service';
import { initialsOf } from '../../core/utils/labels';
import { CountryBadgeComponent } from '../icons/country-badge.component';
import { RankIconComponent } from '../icons/rank-icon.component';
import { ButtonComponent } from '../ui/button.component';

@Component({
  selector: 'app-player-preview-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CountryBadgeComponent, RankIconComponent],
  template: `
    <article class="rounded-2xl border border-border bg-surface p-5">
      <div class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-sm font-extrabold text-accent"
          >
            {{ initials() }}
          </div>
          <div class="min-w-0">
            <h3 class="truncate font-bold">&#64;{{ player().username }}</h3>
            <p class="mt-0.5 text-[10px] text-muted">{{ i18n.t('match.usernameHint') }}</p>
            <p class="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted">
              <app-rank-icon [tier]="rankTier()" [size]="16" />
              <span class="truncate">{{ rank() }} · {{ roles() }}</span>
            </p>
            @if (player().country) {
              <p class="mt-0.5 text-[10px] text-muted">
                <app-country-badge [country]="player().country" />
              </p>
            }
          </div>
        </div>

        @if (score() !== null) {
          <div class="shrink-0 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent">
            {{ i18n.t('match.score', { score: score() ?? 0 }) }}
          </div>
        }
      </div>

      <div class="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-muted">
        <span class="truncate">{{ style() }}</span>
        <span class="truncate">
          {{ player().hasMic ? i18n.t('match.withMic') : i18n.t('match.withoutMic') }}
        </span>
        <span class="truncate">{{ languages() }}</span>
        <span class="truncate">
          {{ i18n.t('match.reputation', { label: player().reputation.label || '—' }) }}
        </span>
      </div>

      @if (reasons().length) {
        <ul class="mt-3 grid gap-1 text-[11px] text-muted">
          @for (reason of reasons().slice(0, 2); track reason) {
            <li class="flex items-start gap-1.5">
              <span class="mt-0.5 shrink-0 text-accent" aria-hidden="true">✓</span>
              <span>{{ reason }}</span>
            </li>
          }
        </ul>
      }

      @if (player().bio) {
        <p class="mt-3 line-clamp-2 text-xs leading-relaxed text-muted">{{ player().bio }}</p>
      }

      @if (showActions()) {
        <div class="mt-4 flex items-center gap-2">
          <app-button [fullWidth]="true" [disabled]="busy()" (click)="like.emit()">
            {{ i18n.t('match.like') }}
          </app-button>
          @if (showPass()) {
            <app-button variant="secondary" size="sm" [disabled]="busy()" (click)="pass.emit()">
              {{ i18n.t('match.pass') }}
            </app-button>
          }
          <app-button variant="danger" size="sm" [disabled]="busy()" (click)="block.emit()">
            {{ i18n.t('match.block') }}
          </app-button>
        </div>
      }
    </article>
  `,
})
export class PlayerPreviewCardComponent {
  protected readonly i18n = inject(I18nService);

  readonly player = input.required<PublicProfile>();
  readonly queue = input<Queue | null>(null);
  readonly score = input<number | null>(null);
  readonly reasons = input<string[]>([]);
  readonly showActions = input(true);
  readonly showPass = input(false);
  readonly busy = input(false);

  readonly like = output<void>();
  readonly pass = output<void>();
  readonly block = output<void>();

  protected readonly initials = computed(() => initialsOf(this.player().username));
  protected readonly rankTier = computed<RankTier>(() => {
    const player = this.player();
    return this.queue() === 'flex' && player.flexRankTier ? player.flexRankTier : player.rankTier;
  });
  protected readonly rank = computed(() => {
    const player = this.player();
    const tier =
      this.queue() === 'flex' && player.flexRankTier ? player.flexRankTier : player.rankTier;
    const division: RankDivision | null =
      this.queue() === 'flex' && player.flexRankTier
        ? player.flexRankDivision
        : player.rankDivision;
    const tierLabel = this.i18n.t(RANK_LABEL_KEYS[tier]);
    const divisionLabel = division ? this.i18n.t(DIVISION_LABEL_KEYS[division]) : '';
    return divisionLabel ? `${tierLabel} ${divisionLabel}` : tierLabel;
  });
  protected readonly roles = computed(() =>
    [this.player().primaryRole, this.player().secondaryRole]
      .map((role) => this.i18n.t(ROLE_LABEL_KEYS[role as Role]))
      .join(' / '),
  );
  protected readonly style = computed(() => this.i18n.t(STYLE_LABEL_KEYS[this.player().playStyle]));
  protected readonly languages = computed(() =>
    this.player()
      .languages.map((language) => this.i18n.t(LANGUAGE_LABEL_KEYS[language]))
      .join(' · '),
  );
}
