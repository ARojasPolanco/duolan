import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import type { Match } from '../../../core/api/models/matching.model';
import type { PublicProfile } from '../../../core/api/models/profile.model';
import { MatchingService } from '../../../core/api/matching.service';
import { TrustService } from '../../../core/api/trust.service';
import { DIVISION_LABEL_KEYS, RANK_LABEL_KEYS, ROLE_LABEL_KEYS } from '../../../core/i18n/labels';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/toast/toast.service';
import { whatsappUrl } from '../../../core/utils/contact';
import { initialsOf } from '../../../core/utils/labels';
import { formatDate } from '../../../core/utils/time';
import { CountryBadgeComponent } from '../../../shared/icons/country-badge.component';
import { RankIconComponent } from '../../../shared/icons/rank-icon.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog.component';
import { EmailVerificationBannerComponent } from '../../../shared/ui/email-verification-banner.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton.component';
import { FeedbackPanelComponent } from '../components/feedback-panel.component';
import { ReportDialogComponent } from '../components/report-dialog.component';

@Component({
  selector: 'app-matches-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonComponent,
    CardComponent,
    ConfirmDialogComponent,
    EmailVerificationBannerComponent,
    SkeletonComponent,
    CountryBadgeComponent,
    RankIconComponent,
    FeedbackPanelComponent,
    ReportDialogComponent,
  ],
  template: `
    <div class="grid gap-5">
      <header>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {{ i18n.t('matches.eyebrow') }}
        </p>
        <h1 class="mt-2 text-2xl font-extrabold sm:text-3xl">{{ i18n.t('matches.title') }}</h1>
        <p class="mt-2 text-sm text-muted">{{ i18n.t('matches.description') }}</p>
      </header>

      <app-email-verification-banner />

      @if (error()) {
        <p class="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          {{ error() }}
        </p>
      }

      @if (loading()) {
        <div class="grid gap-4">
          <app-skeleton variant="card" />
          <app-skeleton variant="card" />
        </div>
      } @else if (!matches().length) {
        <app-card padding="lg">
          <div class="py-6 text-center">
            <h2 class="text-lg font-bold">{{ i18n.t('matches.emptyTitle') }}</h2>
            <p class="mx-auto mt-2 max-w-md text-sm text-muted">
              {{ i18n.t('matches.emptyBody') }}
            </p>
            <app-button class="mt-4" routerLink="/match">
              {{ i18n.t('matches.findDuo') }}
            </app-button>
          </div>
        </app-card>
      } @else {
        <div class="grid gap-4">
          @for (match of matches(); track match.id) {
            <app-card padding="lg">
              <div class="flex items-start justify-between gap-3">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-sm font-extrabold text-accent"
                  >
                    {{ initials(match.other.username) }}
                  </div>
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <h2 class="truncate font-bold">&#64;{{ match.other.username }}</h2>
                      @if (match.source === 'aram') {
                        <span
                          class="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-gold"
                        >
                          {{ i18n.t('matches.sourceAram') }}
                        </span>
                      }
                    </div>
                    <p class="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted">
                      <app-rank-icon [tier]="match.other.rankTier" [size]="16" />
                      <span class="truncate">
                        {{ rankLabel(match.other) }} · {{ rolesLabel(match.other) }}
                      </span>
                    </p>
                    @if (match.other.country) {
                      <p class="mt-0.5 text-[10px] text-muted">
                        <app-country-badge [country]="match.other.country" />
                      </p>
                    }
                  </div>
                </div>
                <span
                  class="rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-muted"
                >
                  {{ match.other.reputation.label || '—' }}
                </span>
              </div>

              <div class="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  (click)="copy('matches.riotId', match.contact.riotId)"
                  class="flex items-center justify-between gap-2 rounded-xl border border-border bg-bg px-4 py-3 text-left"
                >
                  <span>
                    <span class="block text-[11px] text-muted">{{ i18n.t('matches.riotId') }}</span>
                    <span class="text-sm font-semibold">{{ match.contact.riotId }}</span>
                  </span>
                </button>

                @if (match.contact.discordTag) {
                  <button
                    type="button"
                    (click)="copy('matches.discord', match.contact.discordTag)"
                    class="flex items-center justify-between gap-2 rounded-xl border border-border bg-bg px-4 py-3 text-left"
                  >
                    <span>
                      <span class="block text-[11px] text-muted">
                        {{ i18n.t('matches.discord') }}
                      </span>
                      <span class="text-sm font-semibold">{{ match.contact.discordTag }}</span>
                    </span>
                  </button>
                }

                @if (match.contact.whatsapp) {
                  <a
                    [href]="whatsappUrl(match.contact.whatsapp)"
                    target="_blank"
                    rel="noreferrer"
                    class="flex items-center justify-between gap-2 rounded-xl border border-border bg-bg px-4 py-3 text-left"
                  >
                    <span>
                      <span class="block text-[11px] text-muted">
                        {{ i18n.t('matches.whatsapp') }}
                      </span>
                      <span class="text-sm font-semibold">{{ match.contact.whatsapp }}</span>
                    </span>
                  </a>
                }
              </div>

              <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p class="text-xs text-muted">
                  {{ i18n.t('matches.createdOn', { date: formatDate(match.createdAt) }) }}
                </p>

                <div class="flex flex-wrap items-center gap-2">
                  <app-button variant="secondary" size="sm" (click)="toggleFeedback(match.id)">
                    {{
                      match.feedback.mine === 'submitted'
                        ? i18n.t('matches.viewFeedback')
                        : i18n.t('matches.feedback')
                    }}
                  </app-button>
                  <app-button
                    variant="secondary"
                    size="sm"
                    [disabled]="actionId() === match.id"
                    (click)="archive(match)"
                  >
                    {{ i18n.t('matches.archive') }}
                  </app-button>
                  <app-button
                    variant="danger"
                    size="sm"
                    [disabled]="actionId() === match.id"
                    (click)="openReport(match.other)"
                  >
                    {{ i18n.t('matches.report') }}
                  </app-button>
                  <app-button
                    variant="danger"
                    size="sm"
                    [disabled]="actionId() === match.id"
                    (click)="block(match)"
                  >
                    {{ i18n.t('matches.block') }}
                  </app-button>
                </div>
              </div>

              @if (feedbackOpenId() === match.id) {
                <app-feedback-panel
                  [match]="match"
                  (closed)="feedbackOpenId.set(null)"
                  (submitted)="markFeedbackSubmitted(match.id)"
                />
              }
            </app-card>
          }
        </div>
      }
    </div>

    <app-confirm-dialog
      [open]="pendingArchive() !== null"
      [title]="i18n.t('matches.archive')"
      [message]="i18n.t('matches.archiveConfirm', { name: archiveName() })"
      [confirmLabel]="i18n.t('matches.archive')"
      [cancelLabel]="i18n.t('report.cancel')"
      variant="secondary"
      [busy]="archiveBusy()"
      (closed)="closeArchiveDialog()"
      (confirmed)="confirmArchive()"
    />

    <app-confirm-dialog
      [open]="pendingBlock() !== null"
      [title]="i18n.t('matches.block')"
      [message]="i18n.t('matches.blockConfirm', { name: blockName() })"
      [confirmLabel]="i18n.t('matches.block')"
      [cancelLabel]="i18n.t('report.cancel')"
      [busy]="blockBusy()"
      (closed)="closeBlockDialog()"
      (confirmed)="confirmBlock()"
    />

    @if (reportTarget(); as target) {
      <app-report-dialog
        [target]="target"
        [open]="true"
        (closed)="reportTarget.set(null)"
        (reported)="removeByTarget(target.id)"
      />
    }
  `,
})
export class MatchesPage implements OnInit {
  private readonly matching = inject(MatchingService);
  private readonly trust = inject(TrustService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  protected readonly i18n = inject(I18nService);

  protected readonly matches = signal<Match[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly actionId = signal<string | null>(null);
  protected readonly feedbackOpenId = signal<string | null>(null);
  protected readonly reportTarget = signal<PublicProfile | null>(null);
  protected readonly pendingArchive = signal<Match | null>(null);
  protected readonly pendingBlock = signal<Match | null>(null);

  protected readonly initials = (username: string): string => initialsOf(username);
  protected readonly whatsappUrl = whatsappUrl;
  protected readonly formatDate = (value: string): string => formatDate(value, this.i18n.locale());

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');

    this.matching
      .getMatches()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.matches.set(response.matches);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(this.i18n.t('matches.loadError'));
        },
      });
  }

  protected async copy(
    labelKey: 'matches.riotId' | 'matches.discord',
    value: string,
  ): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.toast.success(this.i18n.t('matches.copied', { label: this.i18n.t(labelKey) }));
    } catch {
      this.toast.error(this.i18n.t('matches.copyError'));
    }
  }

  protected archiveName(): string {
    return this.pendingArchive()?.other.username ?? '';
  }

  protected archiveBusy(): boolean {
    const match = this.pendingArchive();
    return match !== null && this.actionId() === match.id;
  }

  protected blockName(): string {
    return this.pendingBlock()?.other.username ?? '';
  }

  protected blockBusy(): boolean {
    const match = this.pendingBlock();
    return match !== null && this.actionId() === match.id;
  }

  protected archive(match: Match): void {
    this.pendingArchive.set(match);
  }

  protected closeArchiveDialog(): void {
    if (this.actionId()) return;
    this.pendingArchive.set(null);
  }

  protected confirmArchive(): void {
    const match = this.pendingArchive();
    if (!match) return;

    this.actionId.set(match.id);

    this.matching
      .archiveMatch(match.id)
      .pipe(
        finalize(() => this.actionId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.matches.update((items) => items.filter((item) => item.id !== match.id));
          this.pendingArchive.set(null);
          this.toast.success(this.i18n.t('matches.archived'));
        },
        error: () => {
          this.pendingArchive.set(null);
          this.toast.error(this.i18n.t('matches.archiveError'));
        },
      });
  }

  protected block(match: Match): void {
    this.pendingBlock.set(match);
  }

  protected closeBlockDialog(): void {
    if (this.actionId()) return;
    this.pendingBlock.set(null);
  }

  protected confirmBlock(): void {
    const match = this.pendingBlock();
    if (!match) return;

    this.actionId.set(match.id);

    this.trust
      .block(match.other.id)
      .pipe(
        finalize(() => this.actionId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.matches.update((items) => items.filter((item) => item.id !== match.id));
          this.pendingBlock.set(null);
          this.toast.success(this.i18n.t('matches.blocked'));
        },
        error: () => {
          this.pendingBlock.set(null);
          this.toast.error(this.i18n.t('matches.blockError'));
        },
      });
  }

  protected toggleFeedback(matchId: string): void {
    this.feedbackOpenId.update((current) => (current === matchId ? null : matchId));
  }

  protected markFeedbackSubmitted(matchId: string): void {
    this.matches.update((items) =>
      items.map((item) =>
        item.id === matchId ? { ...item, feedback: { ...item.feedback, mine: 'submitted' } } : item,
      ),
    );
  }

  protected openReport(target: PublicProfile): void {
    this.reportTarget.set(target);
  }

  protected removeByTarget(targetId: string): void {
    this.matches.update((items) => items.filter((item) => item.other.id !== targetId));
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
}
