import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { TIMEZONE } from '@duolan/shared/constants';
import { finalize } from 'rxjs';
import type { Candidate, Match, MatchReminder } from '../../../core/api/models/matching.model';
import type { MyProfile, PublicProfile } from '../../../core/api/models/profile.model';
import { MatchingService } from '../../../core/api/matching.service';
import { ProfilesService } from '../../../core/api/profiles.service';
import { TrustService } from '../../../core/api/trust.service';
import { AuthService } from '../../../core/auth/auth.service';
import { DIVISION_LABEL_KEYS, RANK_LABEL_KEYS, ROLE_LABEL_KEYS } from '../../../core/i18n/labels';
import { I18nService } from '../../../core/i18n/i18n.service';
import type { TranslationKey } from '../../../core/i18n/translations';
import { MatchingStore } from '../../../core/matching/matching.store';
import { ToastService } from '../../../core/toast/toast.service';
import { initialsOf } from '../../../core/utils/labels';
import { PlayerPreviewCardComponent } from '../../../shared/cards/player-preview-card.component';
import { CountryBadgeComponent } from '../../../shared/icons/country-badge.component';
import { RankIconComponent } from '../../../shared/icons/rank-icon.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog.component';
import { EmailVerificationBannerComponent } from '../../../shared/ui/email-verification-banner.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton.component';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonComponent,
    CardComponent,
    ConfirmDialogComponent,
    EmailVerificationBannerComponent,
    PlayerPreviewCardComponent,
    CountryBadgeComponent,
    RankIconComponent,
    SkeletonComponent,
  ],
  template: `
    <div class="grid gap-5">
      <app-email-verification-banner />

      @if (reminder()?.show) {
        <section
          class="flex flex-col gap-4 rounded-2xl border border-accent/40 bg-accent/10 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h2 class="text-sm font-bold">{{ i18n.t('home.reminderTitle') }}</h2>
            <p class="mt-1 text-xs leading-relaxed text-muted">
              {{ i18n.t('home.reminderBody', { count: reminder()?.pendingIncoming ?? 0 }) }}
            </p>
          </div>
          <div class="flex items-center gap-2 self-stretch sm:self-auto">
            <app-button routerLink="/match">{{ i18n.t('home.reminderCta') }}</app-button>
            <button
              type="button"
              (click)="dismissReminder()"
              class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border text-lg text-muted transition hover:border-accent/60 hover:text-text"
              [attr.aria-label]="i18n.t('home.dismissReminder')"
            >
              &times;
            </button>
          </div>
        </section>
      }

      @if (isAdmin()) {
        <app-card>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="font-bold">{{ i18n.t('home.adminTitle') }}</h2>
              <p class="mt-1 text-sm text-muted">{{ i18n.t('home.adminDescription') }}</p>
            </div>
            <app-button routerLink="/admin">{{ i18n.t('home.adminCta') }}</app-button>
          </div>
        </app-card>
      } @else {
        @if (!profileCompleted()) {
          <app-card>
            <div class="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 class="font-bold">{{ i18n.t('home.completeProfileTitle') }}</h2>
                <p class="mt-1 text-sm text-muted">
                  {{ i18n.t('home.completeProfileDescription') }}
                </p>
              </div>
              <app-button routerLink="/onboarding">
                {{ i18n.t('home.completeProfileCta') }}
              </app-button>
            </div>
          </app-card>
        }

        <section
          class="relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8"
        >
          <div class="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {{ i18n.t('home.eyebrow') }}
              </p>
              <h1 class="mt-2 text-2xl font-extrabold sm:text-3xl">
                {{ i18n.t('home.greeting', { name: user()?.username ?? '' }) }}
              </h1>
              <p class="mt-2 text-sm text-muted">{{ user()?.email }}</p>
              @if (user()?.country) {
                <p class="mt-1 text-xs text-muted">
                  <app-country-badge [country]="user()?.country ?? null" />
                </p>
              }

              <div class="mt-5 grid gap-3 sm:grid-cols-2">
                <div class="rounded-xl border border-border bg-bg p-4">
                  <p class="text-xs text-muted">{{ i18n.t('home.rank') }}</p>
                  <p class="mt-1 flex items-center gap-2 text-sm font-semibold">
                    @if (profile()) {
                      <app-rank-icon [tier]="profile()!.rankTier" [size]="24" />
                    }
                    <span>{{ profile() ? rankLabel(profile()!) : '-' }}</span>
                  </p>
                </div>
                <div class="rounded-xl border border-border bg-bg p-4">
                  <p class="text-xs text-muted">{{ i18n.t('home.roles') }}</p>
                  <p class="mt-1 text-sm font-semibold">
                    {{ profile() ? rolesLabel(profile()!) : '-' }}
                  </p>
                </div>
                <div class="rounded-xl border border-border bg-bg p-4">
                  <p class="text-xs text-muted">{{ i18n.t('home.reputation') }}</p>
                  <p class="mt-1 text-sm font-semibold">
                    {{ profile()?.reputation?.label || '-' }}
                  </p>
                </div>
                <div class="rounded-xl border border-border bg-bg p-4">
                  <p class="text-xs text-muted">{{ i18n.t('home.account') }}</p>
                  <p class="mt-1 text-sm font-semibold">
                    {{
                      user()?.emailVerified
                        ? i18n.t('home.emailVerified')
                        : i18n.t('home.emailPending')
                    }}
                  </p>
                </div>
              </div>

              <div class="mt-5 flex flex-wrap gap-2">
                <app-button routerLink="/match">{{ i18n.t('home.searchDuo') }}</app-button>
                <app-button variant="secondary" routerLink="/matches">
                  {{ i18n.t('home.viewMatches') }}
                </app-button>
                <app-button variant="secondary" routerLink="/disponible">
                  {{ i18n.t('common.available') }}
                </app-button>
                <app-button variant="secondary" routerLink="/busco-1">
                  {{ i18n.t('common.lookingForOne') }}
                </app-button>
                <app-button variant="secondary" routerLink="/invitaciones">
                  {{ i18n.t('common.invitations') }}
                </app-button>
                <app-button variant="ghost" routerLink="/perfil">
                  {{ i18n.t('home.editProfile') }}
                </app-button>
              </div>
            </div>

            <div class="rounded-2xl border border-border bg-bg p-5">
              <div class="flex items-center gap-3">
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2 text-lg font-extrabold text-accent"
                >
                  {{ initials() }}
                </div>
                <div class="min-w-0">
                  <p class="truncate font-bold">{{ user()?.username }}</p>
                  <p class="flex items-center gap-1.5 text-xs text-muted">
                    @if (profile()) {
                      <app-rank-icon [tier]="profile()!.rankTier" [size]="15" />
                    }
                    <span>{{ profile() ? rankLabel(profile()!) : '-' }}</span>
                  </p>
                </div>
              </div>

              @if (loadingProfile()) {
                <app-skeleton class="mt-5" variant="text" />
              } @else if (profile(); as profile) {
                <div class="mt-5 grid gap-2">
                  <button
                    type="button"
                    (click)="copy('matches.riotId', profile.riotId)"
                    class="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-left"
                  >
                    <span>
                      <span class="block text-[10px] uppercase tracking-wide text-muted">
                        {{ i18n.t('matches.riotId') }}
                      </span>
                      <span class="text-sm font-semibold">{{ profile.riotId }}</span>
                    </span>
                    <span class="text-xs font-bold text-accent">Copy</span>
                  </button>

                  @if (profile.discordTag) {
                    <button
                      type="button"
                      (click)="copy('matches.discord', profile.discordTag)"
                      class="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-left"
                    >
                      <span>
                        <span class="block text-[10px] uppercase tracking-wide text-muted">
                          {{ i18n.t('matches.discord') }}
                        </span>
                        <span class="text-sm font-semibold">{{ profile.discordTag }}</span>
                      </span>
                      <span class="text-xs font-bold text-accent">Copy</span>
                    </button>
                  }

                  @if (profile.whatsapp) {
                    <button
                      type="button"
                      (click)="copy('matches.whatsapp', profile.whatsapp)"
                      class="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-3 py-2.5 text-left"
                    >
                      <span>
                        <span class="block text-[10px] uppercase tracking-wide text-muted">
                          {{ i18n.t('matches.whatsapp') }}
                        </span>
                        <span class="text-sm font-semibold">{{ profile.whatsapp }}</span>
                      </span>
                      <span class="text-xs font-bold text-accent">Copy</span>
                    </button>
                  }

                  <p class="pt-1 text-[11px] leading-relaxed text-muted">
                    {{ i18n.t('home.contactNote') }}
                  </p>
                </div>
              } @else {
                <p class="mt-5 text-sm text-muted">
                  {{ i18n.t('home.completeProfileDescription') }}
                </p>
                <app-button class="mt-3" routerLink="/onboarding">
                  {{ i18n.t('home.completeProfileCta') }}
                </app-button>
              }
            </div>
          </div>
        </section>

        <section>
          <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {{ i18n.t('common.match') }}
              </p>
              <h2 class="mt-2 text-2xl font-extrabold">{{ i18n.t('home.candidatesTitle') }}</h2>
              <p class="mt-1 text-sm text-muted">{{ i18n.t('home.candidatesBody') }}</p>
            </div>
            <div class="flex items-center gap-2">
              <app-button
                variant="secondary"
                size="sm"
                [loading]="candidatesLoading()"
                (click)="refreshAll()"
              >
                {{ i18n.t('home.refreshPlayers') }}
              </app-button>
              <app-button routerLink="/match">{{ i18n.t('home.viewAll') }}</app-button>
            </div>
          </div>

          @if (!canInteract()) {
            <app-card padding="lg">
              <p class="text-sm text-muted">{{ i18n.t('home.verificationRequired') }}</p>
            </app-card>
          } @else if (candidatesLoading()) {
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <app-skeleton variant="card" />
              <app-skeleton variant="card" />
              <app-skeleton variant="card" />
            </div>
          } @else if (candidates().length) {
            <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              @for (candidate of candidates(); track candidate.profile.id) {
                <app-player-preview-card
                  [player]="candidate.profile"
                  [score]="candidate.score"
                  [reasons]="candidate.reasons"
                  [busy]="actionId() === candidate.profile.id"
                  (like)="like(candidate)"
                  (block)="block(candidate)"
                />
              }
            </div>
          } @else {
            <app-card padding="lg">
              <p class="text-sm text-muted">{{ i18n.t('home.candidatesEmpty') }}</p>
            </app-card>
          }
        </section>

        <section>
          <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {{ i18n.t('common.matches') }}
              </p>
              <h2 class="mt-2 text-2xl font-extrabold">{{ i18n.t('home.matchesTitle') }}</h2>
            </div>
            <a
              routerLink="/matches"
              class="inline-flex min-h-11 items-center text-xs font-semibold text-accent hover:underline"
            >
              {{ i18n.t('home.viewAll') }}
            </a>
          </div>

          @if (!canInteract()) {
            <app-card padding="lg">
              <p class="text-sm text-muted">{{ i18n.t('home.verificationRequired') }}</p>
            </app-card>
          } @else if (matchesLoading()) {
            <div class="grid gap-4 sm:grid-cols-2">
              <app-skeleton variant="card" />
              <app-skeleton variant="card" />
            </div>
          } @else if (matches().length) {
            <div class="grid gap-4 sm:grid-cols-2">
              @for (match of matches().slice(0, 2); track match.id) {
                <article class="rounded-2xl border border-border bg-surface p-5">
                  <div class="flex items-center gap-3">
                    <div
                      class="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-2 text-sm font-extrabold text-accent"
                    >
                      {{ initialsOf(match.other.username) }}
                    </div>
                    <div class="min-w-0">
                      <p class="truncate font-bold">{{ match.other.username }}</p>
                      <p class="flex min-w-0 items-center gap-1.5 text-xs text-muted">
                        <app-rank-icon [tier]="match.other.rankTier" [size]="15" />
                        <span class="truncate">
                          {{ rankLabel(match.other) }} &middot; {{ rolesLabel(match.other) }}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    (click)="copy('matches.riotId', match.contact.riotId)"
                    class="mt-4 flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-bg px-3 py-2.5 text-left"
                  >
                    <span>
                      <span class="block text-[10px] uppercase tracking-wide text-muted">
                        {{ i18n.t('matches.riotId') }}
                      </span>
                      <span class="text-sm font-semibold">{{ match.contact.riotId }}</span>
                    </span>
                    <span class="text-xs font-bold text-accent">Copy</span>
                  </button>

                  <a
                    routerLink="/matches"
                    class="mt-2 flex min-h-11 items-center justify-center text-xs font-semibold text-accent hover:underline"
                  >
                    {{ i18n.t('home.openMatch') }}
                  </a>
                </article>
              }
            </div>
          } @else {
            <app-card padding="lg">
              <p class="text-sm text-muted">{{ i18n.t('home.matchesEmpty') }}</p>
            </app-card>
          }
        </section>
      }

      <app-confirm-dialog
        [open]="pendingBlock() !== null"
        [title]="i18n.t('match.block')"
        [message]="i18n.t('match.blockConfirm', { name: blockName() })"
        [confirmLabel]="i18n.t('match.block')"
        [cancelLabel]="i18n.t('report.cancel')"
        [busy]="blockBusy()"
        (closed)="closeBlockDialog()"
        (confirmed)="confirmBlock()"
      />
    </div>
  `,
})
export class HomePage implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly profiles = inject(ProfilesService);
  private readonly matching = inject(MatchingService);
  private readonly trust = inject(TrustService);
  private readonly matchingStore = inject(MatchingStore);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly i18n = inject(I18nService);

  protected readonly user = this.auth.user;
  protected readonly profileCompleted = computed(() => this.auth.profileCompleted());
  protected readonly isAdmin = computed(() => this.auth.isAdmin());
  protected readonly canInteract = computed(
    () =>
      Boolean(this.user()?.emailVerified && this.user()?.profileCompleted) &&
      this.user()?.role !== 'admin',
  );
  protected readonly initials = computed(() => initialsOf(this.user()?.username));

  protected readonly profile = signal<MyProfile | null>(null);
  protected readonly loadingProfile = signal(true);
  protected readonly reminder = signal<MatchReminder | null>(null);
  protected readonly candidates = signal<Candidate[]>([]);
  protected readonly candidatesLoading = signal(false);
  protected readonly matches = signal<Match[]>([]);
  protected readonly matchesLoading = signal(false);
  protected readonly actionId = signal<string | null>(null);
  protected readonly pendingBlock = signal<Candidate | null>(null);

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.loadingProfile.set(false);
      return;
    }

    this.loadProfile();
    this.loadReminder();
    this.refreshAll();
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

  protected initialsOf(username: string | null | undefined): string {
    return initialsOf(username);
  }

  protected refreshAll(): void {
    if (!this.canInteract()) {
      this.candidates.set([]);
      this.matches.set([]);
      return;
    }

    this.loadCandidates();
    this.loadMatches();
    this.matchingStore.refresh();
  }

  protected async copy(labelKey: TranslationKey, value: string | null): Promise<void> {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      this.toast.success(this.i18n.t('matches.copied', { label: this.i18n.t(labelKey) }));
    } catch {
      this.toast.error(this.i18n.t('matches.copyError'));
    }
  }

  protected like(candidate: Candidate): void {
    const snapshot = this.candidates();
    this.removeCandidate(candidate.profile.id);
    this.actionId.set(candidate.profile.id);

    this.matching
      .like(candidate.profile.id)
      .pipe(
        finalize(() => this.actionId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          this.toast.success(
            this.i18n.t(response.matched ? 'match.matchCreated' : 'match.likeSent'),
          );
          this.loadCandidates();
          this.loadMatches();
          this.loadReminder();
          this.matchingStore.refresh();
        },
        error: () => {
          this.candidates.set(snapshot);
          this.toast.error(this.i18n.t('match.likeError'));
        },
      });
  }

  protected blockName(): string {
    return this.pendingBlock()?.profile.username ?? '';
  }

  protected blockBusy(): boolean {
    const candidate = this.pendingBlock();
    return candidate !== null && this.actionId() === candidate.profile.id;
  }

  protected block(candidate: Candidate): void {
    this.pendingBlock.set(candidate);
  }

  protected closeBlockDialog(): void {
    if (this.actionId()) return;
    this.pendingBlock.set(null);
  }

  protected confirmBlock(): void {
    const candidate = this.pendingBlock();
    if (!candidate) return;

    this.actionId.set(candidate.profile.id);

    this.trust
      .block(candidate.profile.id)
      .pipe(
        finalize(() => this.actionId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.removeCandidate(candidate.profile.id);
          this.pendingBlock.set(null);
          this.matchingStore.refresh();
          this.toast.success(this.i18n.t('match.blocked'));
        },
        error: () => {
          this.pendingBlock.set(null);
          this.toast.error(this.i18n.t('match.blockError'));
        },
      });
  }

  protected dismissReminder(): void {
    localStorage.setItem(this.reminderDismissKey(), '1');
    this.reminder.set(null);
  }

  private loadProfile(): void {
    this.profiles
      .getMine()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.profile.set(response.profile);
          this.loadingProfile.set(false);
        },
        error: () => {
          this.loadingProfile.set(false);
          this.toast.error(this.i18n.t('home.profileLoadError'));
        },
      });
  }

  private loadCandidates(): void {
    if (!this.canInteract()) {
      this.candidates.set([]);
      return;
    }

    this.candidatesLoading.set(true);
    this.matching
      .getCandidates({ limit: 3 })
      .pipe(
        finalize(() => this.candidatesLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.candidates.set(response.candidates),
        error: () => this.candidates.set([]),
      });
  }

  private loadMatches(): void {
    if (!this.canInteract()) {
      this.matches.set([]);
      return;
    }

    this.matchesLoading.set(true);
    this.matching
      .getMatches()
      .pipe(
        finalize(() => this.matchesLoading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => this.matches.set(response.matches),
        error: () => this.matches.set([]),
      });
  }

  private loadReminder(): void {
    if (!this.canInteract() || localStorage.getItem(this.reminderDismissKey())) {
      this.reminder.set(null);
      return;
    }

    this.matching
      .getReminder()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.reminder.set(response.reminder),
        error: () => this.reminder.set(null),
      });
  }

  private removeCandidate(userId: string): void {
    this.candidates.update((items) => items.filter((item) => item.profile.id !== userId));
  }

  private reminderDismissKey(): string {
    const today = new Intl.DateTimeFormat('en-CA', {
      timeZone: TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    return `match-reminder-dismissed:${today}`;
  }
}
