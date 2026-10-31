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
import type {
  AvailabilityPlayer,
  AvailabilitySession,
} from '../../../core/api/models/availability.model';
import type { Queue, Role } from '../../../core/api/models/enums';
import type { PublicProfile } from '../../../core/api/models/profile.model';
import { AvailabilityService } from '../../../core/api/availability.service';
import { AuthService } from '../../../core/auth/auth.service';
import {
  DIVISION_LABEL_KEYS,
  QUEUE_LABEL_KEYS,
  RANK_LABEL_KEYS,
  ROLE_LABEL_KEYS,
  STYLE_LABEL_KEYS,
} from '../../../core/i18n/labels';
import { I18nService } from '../../../core/i18n/i18n.service';
import { PROFILE_ROLES } from '../../../core/profile/profile-options';
import { ToastService } from '../../../core/toast/toast.service';
import { formatTime } from '../../../core/utils/time';
import { initialsOf } from '../../../core/utils/labels';
import { CountryBadgeComponent } from '../../../shared/icons/country-badge.component';
import { RankIconComponent } from '../../../shared/icons/rank-icon.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';
import { EmailVerificationBannerComponent } from '../../../shared/ui/email-verification-banner.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton.component';

interface InviteDraft {
  role: Role;
  message: string;
}

@Component({
  selector: 'app-availability-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonComponent,
    CardComponent,
    EmailVerificationBannerComponent,
    CountryBadgeComponent,
    RankIconComponent,
    SkeletonComponent,
  ],
  template: `
    <div class="grid gap-5">
      <header>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {{ i18n.t('availability.eyebrow') }}
        </p>
        <h1 class="mt-2 text-2xl font-extrabold sm:text-3xl">
          {{ i18n.t('availability.title') }}
        </h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {{ i18n.t('availability.description') }}
        </p>
        <a
          routerLink="/como-funciona"
          class="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-accent hover:underline"
        >
          {{ i18n.t('availability.howItWorks') }}
        </a>
      </header>

      <app-email-verification-banner />

      @if (!canInteract()) {
        <app-card padding="lg">
          <h2 class="text-lg font-bold">{{ i18n.t('availability.needsAccountTitle') }}</h2>
          <p class="mt-2 text-sm text-muted">{{ i18n.t('availability.needsAccountBody') }}</p>
          <div class="mt-4 flex flex-col gap-3 sm:flex-row">
            @if (!user()?.profileCompleted) {
              <app-button routerLink="/onboarding">
                {{ i18n.t('match.completeProfile') }}
              </app-button>
            }
            @if (!user()?.emailVerified) {
              <span
                class="rounded-xl border border-border px-5 py-3 text-center text-sm text-muted"
              >
                {{ i18n.t('match.verifyEmail') }}
              </span>
            }
          </div>
        </app-card>
      } @else if (loading()) {
        <app-skeleton variant="card" />
      } @else {
        @if (session(); as session) {
          <section class="rounded-2xl border border-accent/40 bg-accent/5 p-5">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p
                  class="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-accent"
                >
                  {{ i18n.t('availability.activeTitle') }}
                </p>
                <h2 class="mt-2 text-lg font-bold">
                  {{ i18n.t(QUEUE_LABEL_KEYS[session.queue]) }} ·
                  {{ rolesLabel(session.roles) }}
                </h2>
                <p class="mt-1 text-xs text-muted">
                  {{
                    i18n.t('availability.expiresAt', {
                      time: formatTime(session.expiresAt, i18n.locale()),
                      minutes: minutesLeft(session.expiresAt),
                    })
                  }}
                </p>
                @if (session.note) {
                  <p class="mt-2 text-sm text-muted">{{ session.note }}</p>
                }
              </div>
              <app-button
                variant="secondary"
                size="sm"
                [loading]="busy()"
                (click)="closeAvailability()"
              >
                {{ i18n.t('availability.close') }}
              </app-button>
            </div>
          </section>
        } @else {
          <app-card padding="lg">
            <h2 class="text-lg font-bold">{{ i18n.t('availability.openTitle') }}</h2>
            <form class="mt-4 grid gap-4" (submit)="openAvailability($event)">
              <div>
                <p class="text-xs font-semibold text-muted">
                  {{ i18n.t('availability.rolesLabel') }}
                </p>
                <div class="mt-2 flex flex-wrap gap-2">
                  @for (role of roleOptions; track role) {
                    <button
                      type="button"
                      (click)="toggleRole(role)"
                      [class]="choiceClass(selectedRoles().includes(role))"
                    >
                      {{ i18n.t(ROLE_LABEL_KEYS[role]) }}
                    </button>
                  }
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <label class="grid gap-1.5 text-xs font-semibold text-muted">
                  {{ i18n.t('availability.queueLabel') }}
                  <select
                    [value]="selectedQueue()"
                    (change)="setQueue($event)"
                    class="min-h-11 rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text"
                  >
                    @for (queue of queueOptions; track queue) {
                      <option [value]="queue">{{ i18n.t(QUEUE_LABEL_KEYS[queue]) }}</option>
                    }
                  </select>
                </label>

                <div>
                  <p class="text-xs font-semibold text-muted">
                    {{ i18n.t('availability.duration') }}
                  </p>
                  <div class="mt-2 flex gap-2">
                    @for (minutes of ttlOptions; track minutes) {
                      <button
                        type="button"
                        (click)="ttlMinutes.set(minutes)"
                        [class]="choiceClass(ttlMinutes() === minutes, 'flex-1')"
                      >
                        {{ i18n.t('availability.minutes', { minutes }) }}
                      </button>
                    }
                  </div>
                </div>
              </div>

              <label class="grid gap-1.5 text-xs font-semibold text-muted">
                {{ i18n.t('availability.noteLabel') }}
                <textarea
                  [value]="note()"
                  (input)="setNote($event)"
                  maxlength="140"
                  rows="2"
                  [placeholder]="i18n.t('availability.notePlaceholder')"
                  class="resize-none rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-muted/60"
                ></textarea>
              </label>

              <div>
                <app-button type="submit" [loading]="busy()">
                  {{ i18n.t('availability.openCta') }}
                </app-button>
              </div>
            </form>
          </app-card>
        }

        <section>
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {{ i18n.t('availability.playersEyebrow') }}
              </p>
              <h2 class="mt-1 text-2xl font-extrabold">
                {{ i18n.t('availability.playersTitle') }}
              </h2>
            </div>
            <div class="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:items-center">
              <select
                [value]="filterQueue()"
                (change)="setFilterQueue($event)"
                class="min-h-11 w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text sm:w-auto"
              >
                <option value="">{{ i18n.t('availability.allQueues') }}</option>
                @for (queue of queueOptions; track queue) {
                  <option [value]="queue">{{ i18n.t(QUEUE_LABEL_KEYS[queue]) }}</option>
                }
              </select>
              <select
                [value]="filterRole()"
                (change)="setFilterRole($event)"
                class="min-h-11 w-full rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text sm:w-auto"
              >
                <option value="">{{ i18n.t('availability.allRoles') }}</option>
                @for (role of roleOptions; track role) {
                  <option [value]="role">{{ i18n.t(ROLE_LABEL_KEYS[role]) }}</option>
                }
              </select>
              <app-button
                class="col-span-2 sm:col-span-1"
                variant="secondary"
                size="sm"
                [loading]="playersLoading()"
                (click)="loadPlayers()"
              >
                {{ i18n.t('availability.reload') }}
              </app-button>
            </div>
          </div>

          @if (error()) {
            <p
              class="mb-4 rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger"
            >
              {{ error() }}
            </p>
          }

          @if (playersLoading()) {
            <div class="grid gap-4 md:grid-cols-2">
              <app-skeleton variant="card" />
              <app-skeleton variant="card" />
            </div>
          } @else if (players().length) {
            <div class="grid gap-4 md:grid-cols-2">
              @for (player of players(); track player.session.id) {
                <article class="rounded-2xl border border-border bg-surface p-5">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex min-w-0 items-center gap-3">
                      <div
                        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-sm font-extrabold text-accent"
                      >
                        {{ initials(player.profile.username) }}
                      </div>
                      <div class="min-w-0">
                        <h3 class="truncate font-bold">&#64;{{ player.profile.username }}</h3>
                        <p class="mt-0.5 text-[10px] text-muted">
                          {{ i18n.t('match.usernameHint') }}
                        </p>
                        <p class="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted">
                          <app-rank-icon
                            [tier]="rankTierForQueue(player.profile, player.session.queue)"
                            [size]="16"
                          />
                          <span class="truncate">
                            {{ rankLabel(player.profile, player.session.queue) }} ·
                            {{ profileRolesLabel(player.profile) }}
                          </span>
                        </p>
                        @if (player.profile.country) {
                          <p class="mt-0.5 text-[10px] text-muted">
                            <app-country-badge [country]="player.profile.country" />
                          </p>
                        }
                      </div>
                    </div>
                    <div
                      class="shrink-0 rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-accent"
                    >
                      {{ i18n.t('match.score', { score: player.score }) }}
                    </div>
                  </div>

                  <div class="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-muted">
                    <span class="rounded-full border border-border px-2 py-1">
                      {{ i18n.t(QUEUE_LABEL_KEYS[player.session.queue]) }}
                    </span>
                    <span class="rounded-full border border-border px-2 py-1">
                      {{
                        i18n.t('availability.seeks', { roles: rolesLabel(player.session.roles) })
                      }}
                    </span>
                    <span class="rounded-full border border-border px-2 py-1">
                      {{ i18n.t(STYLE_LABEL_KEYS[player.profile.playStyle]) }}
                    </span>
                    <span class="rounded-full border border-border px-2 py-1">
                      {{
                        i18n.t('availability.minutesLeft', {
                          minutes: minutesLeft(player.session.expiresAt),
                        })
                      }}
                    </span>
                  </div>

                  @if (player.session.note) {
                    <p class="mt-3 text-sm leading-relaxed text-muted">{{ player.session.note }}</p>
                  }

                  <p class="mt-3 text-[11px] text-muted">
                    {{ i18n.t('availability.contactHidden') }}
                  </p>

                  @if (sentInvites()[player.session.id]) {
                    <p
                      class="mt-4 rounded-xl border border-success/40 bg-success/10 px-3 py-2.5 text-xs font-semibold text-success"
                    >
                      {{ i18n.t('availability.inviteSent') }}
                    </p>
                  } @else {
                    <div class="mt-4 grid gap-2">
                      <div class="grid gap-2 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                        <select
                          [value]="draftFor(player).role"
                          (change)="updateDraftRole(player, $event)"
                          class="min-h-11 w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-xs text-text"
                        >
                          @for (role of player.session.roles; track role) {
                            <option [value]="role">
                              {{
                                i18n.t('availability.inviteAs', {
                                  role: i18n.t(ROLE_LABEL_KEYS[role]),
                                })
                              }}
                            </option>
                          }
                        </select>
                        <input
                          [value]="draftFor(player).message"
                          (input)="updateDraftMessage(player, $event)"
                          maxlength="140"
                          [placeholder]="i18n.t('availability.messagePlaceholder')"
                          class="min-h-11 w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-xs text-text placeholder:text-muted/60"
                        />
                      </div>
                      <app-button
                        [fullWidth]="true"
                        size="sm"
                        [loading]="invitingId() === player.session.id"
                        (click)="invite(player)"
                      >
                        {{ i18n.t('availability.invite') }}
                      </app-button>
                    </div>
                  }
                </article>
              }
            </div>
          } @else {
            <app-card padding="lg">
              <div class="py-6 text-center">
                <h3 class="font-bold">{{ i18n.t('availability.emptyTitle') }}</h3>
                <p class="mx-auto mt-2 max-w-md text-sm text-muted">
                  {{ i18n.t('availability.emptyBody') }}
                </p>
              </div>
            </app-card>
          }
        </section>
      }
    </div>
  `,
})
export class AvailabilityPage implements OnInit {
  private readonly availability = inject(AvailabilityService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly i18n = inject(I18nService);

  protected readonly ROLE_LABEL_KEYS = ROLE_LABEL_KEYS;
  protected readonly QUEUE_LABEL_KEYS = QUEUE_LABEL_KEYS;
  protected readonly STYLE_LABEL_KEYS = STYLE_LABEL_KEYS;
  protected readonly roleOptions = PROFILE_ROLES;
  protected readonly queueOptions: Queue[] = ['solo_duo', 'flex'];
  protected readonly ttlOptions = [30, 60] as const;

  protected readonly user = this.auth.user;
  protected readonly canInteract = computed(() =>
    Boolean(this.user()?.emailVerified && this.user()?.profileCompleted),
  );

  protected readonly session = signal<AvailabilitySession | null>(null);
  protected readonly players = signal<AvailabilityPlayer[]>([]);
  protected readonly selectedRoles = signal<Role[]>(['mid']);
  protected readonly selectedQueue = signal<Queue>('solo_duo');
  protected readonly ttlMinutes = signal<30 | 60>(30);
  protected readonly note = signal('');
  protected readonly filterQueue = signal<Queue | ''>('');
  protected readonly filterRole = signal<Role | ''>('');
  protected readonly loading = signal(true);
  protected readonly playersLoading = signal(false);
  protected readonly busy = signal(false);
  protected readonly invitingId = signal<string | null>(null);
  protected readonly error = signal('');
  protected readonly drafts = signal<Record<string, InviteDraft>>({});
  protected readonly sentInvites = signal<Record<string, boolean>>({});
  protected readonly nowTick = signal(Date.now());

  private readonly timer = setInterval(() => this.nowTick.set(Date.now()), 30_000);

  constructor() {
    this.destroyRef.onDestroy(() => clearInterval(this.timer));
  }

  ngOnInit(): void {
    this.loadMine();
    this.loadPlayers();
  }

  protected roleLabel(role: Role): string {
    return this.i18n.t(ROLE_LABEL_KEYS[role]);
  }

  protected rolesLabel(roles: Role[]): string {
    return roles.map((role) => this.roleLabel(role)).join(' / ');
  }

  protected profileRolesLabel(profile: PublicProfile): string {
    return `${this.i18n.t(ROLE_LABEL_KEYS[profile.primaryRole])} / ${this.i18n.t(
      ROLE_LABEL_KEYS[profile.secondaryRole],
    )}`;
  }

  protected rankTierForQueue(profile: PublicProfile, queue: Queue) {
    return queue === 'flex' && profile.flexRankTier ? profile.flexRankTier : profile.rankTier;
  }

  protected rankLabel(profile: PublicProfile, queue: Queue): string {
    const tier = this.rankTierForQueue(profile, queue);
    const division =
      queue === 'flex' && profile.flexRankTier ? profile.flexRankDivision : profile.rankDivision;
    const tierLabel = this.i18n.t(RANK_LABEL_KEYS[tier]);
    const divisionLabel = division ? this.i18n.t(DIVISION_LABEL_KEYS[division]) : '';
    return divisionLabel ? `${tierLabel} ${divisionLabel}` : tierLabel;
  }

  protected initials(username: string): string {
    return initialsOf(username);
  }

  protected minutesLeft(value: string): number {
    const diff = new Date(value).getTime() - this.nowTick();
    return Math.max(0, Math.ceil(diff / 60_000));
  }

  protected formatTime = formatTime;

  protected choiceClass(selected: boolean, extra = ''): string {
    return `${extra} min-h-11 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
      selected
        ? 'border-accent bg-accent/15 text-accent'
        : 'border-border text-muted hover:border-accent/50'
    }`;
  }

  protected toggleRole(role: Role): void {
    const current = this.selectedRoles();
    if (current.includes(role)) {
      this.selectedRoles.set(current.filter((item) => item !== role));
      return;
    }
    if (current.length >= 2) return;
    this.selectedRoles.set([...current, role]);
  }

  protected setQueue(event: Event): void {
    this.selectedQueue.set((event.target as HTMLSelectElement).value as Queue);
  }

  protected setFilterQueue(event: Event): void {
    this.filterQueue.set((event.target as HTMLSelectElement).value as Queue | '');
    this.loadPlayers();
  }

  protected setFilterRole(event: Event): void {
    this.filterRole.set((event.target as HTMLSelectElement).value as Role | '');
    this.loadPlayers();
  }

  protected setNote(event: Event): void {
    this.note.set((event.target as HTMLTextAreaElement).value);
  }

  protected openAvailability(event: Event): void {
    event.preventDefault();

    if (!this.selectedRoles().length) {
      this.toast.error(this.i18n.t('availability.needRole'));
      return;
    }

    this.busy.set(true);
    this.error.set('');

    this.availability
      .create({
        roles: this.selectedRoles(),
        queue: this.selectedQueue(),
        note: this.note().trim() || undefined,
        ttlMinutes: this.ttlMinutes(),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.busy.set(false);
          this.session.set(response.session);
          this.toast.success(this.i18n.t('availability.toastOpened'));
          this.loadPlayers();
        },
        error: () => {
          this.busy.set(false);
          this.toast.error(this.i18n.t('availability.openError'));
        },
      });
  }

  protected closeAvailability(): void {
    this.busy.set(true);

    this.availability
      .close()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busy.set(false);
          this.session.set(null);
          this.toast.success(this.i18n.t('availability.toastClosed'));
          this.loadPlayers();
        },
        error: () => {
          this.busy.set(false);
          this.toast.error(this.i18n.t('availability.closeError'));
        },
      });
  }

  protected draftFor(player: AvailabilityPlayer): InviteDraft {
    return (
      this.drafts()[player.session.id] ?? {
        role: player.session.roles[0] ?? 'fill',
        message: '',
      }
    );
  }

  protected updateDraftRole(player: AvailabilityPlayer, event: Event): void {
    const role = (event.target as HTMLSelectElement).value as Role;
    const current = this.draftFor(player);
    this.drafts.update((drafts) => ({
      ...drafts,
      [player.session.id]: { ...current, role },
    }));
  }

  protected updateDraftMessage(player: AvailabilityPlayer, event: Event): void {
    const message = (event.target as HTMLInputElement).value;
    const current = this.draftFor(player);
    this.drafts.update((drafts) => ({
      ...drafts,
      [player.session.id]: { ...current, message },
    }));
  }

  protected invite(player: AvailabilityPlayer): void {
    const draft = this.draftFor(player);
    this.invitingId.set(player.session.id);

    this.availability
      .invite(player.session.id, {
        role: draft.role,
        message: draft.message.trim() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.invitingId.set(null);
          this.sentInvites.update((sent) => ({ ...sent, [player.session.id]: true }));
          this.toast.success(
            this.i18n.t('availability.toastInvited', { name: player.profile.username }),
          );
        },
        error: () => {
          this.invitingId.set(null);
          this.toast.error(this.i18n.t('availability.inviteError'));
        },
      });
  }

  protected loadPlayers(): void {
    if (!this.canInteract()) {
      this.players.set([]);
      return;
    }

    this.playersLoading.set(true);

    this.availability
      .list({
        ...(this.filterQueue() ? { queue: this.filterQueue() as Queue } : {}),
        ...(this.filterRole() ? { role: this.filterRole() as Role } : {}),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.playersLoading.set(false);
          this.players.set(response.players);
        },
        error: () => {
          this.playersLoading.set(false);
          this.players.set([]);
          this.error.set(this.i18n.t('availability.playersLoadError'));
        },
      });
  }

  private loadMine(): void {
    if (!this.canInteract()) {
      this.loading.set(false);
      return;
    }

    this.availability
      .getMine()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.session.set(response.session);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(this.i18n.t('availability.loadError'));
        },
      });
  }
}
