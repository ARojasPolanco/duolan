import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { PublicProfile } from '../../core/api/models/profile.model';
import {
  LANGUAGE_LABELS,
  STYLE_LABELS,
  formatRank,
  formatRoles,
  initialsOf,
} from '../../core/utils/labels';
import { ButtonComponent } from '../ui/button.component';
import { CountryBadgeComponent } from '../icons/country-badge.component';
import { RankIconComponent } from '../icons/rank-icon.component';

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
            <p class="mt-0.5 text-[10px] text-muted">Usuario de Duo LAN, no Riot ID</p>
            <p class="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted">
              <app-rank-icon [tier]="player().rankTier" [size]="16" />
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
            {{ score() }} pts
          </div>
        }
      </div>

      <div class="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-muted">
        <span class="truncate">{{ style() }}</span>
        <span class="truncate">{{ player().hasMic ? 'Con mic' : 'Sin mic' }}</span>
        <span class="truncate">{{ languages() }}</span>
        <span class="truncate">Reputación {{ player().reputation.label || 'Nuevo' }}</span>
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
            Me interesa
          </app-button>
          <app-button variant="danger" size="sm" [disabled]="busy()" (click)="block.emit()">
            Bloquear
          </app-button>
        </div>
      }
    </article>
  `,
})
export class PlayerPreviewCardComponent {
  readonly player = input.required<PublicProfile>();
  readonly score = input<number | null>(null);
  readonly reasons = input<string[]>([]);
  readonly showActions = input(true);
  readonly busy = input(false);

  readonly like = output<void>();
  readonly block = output<void>();

  protected readonly initials = computed(() => initialsOf(this.player().username));
  protected readonly rank = computed(() => formatRank(this.player()));
  protected readonly roles = computed(() => formatRoles(this.player()));
  protected readonly style = computed(() => STYLE_LABELS[this.player().playStyle]);
  protected readonly languages = computed(() =>
    this.player()
      .languages.map((language) => LANGUAGE_LABELS[language] ?? language)
      .join(' · '),
  );
}
