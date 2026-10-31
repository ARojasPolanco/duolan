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
  ApplicationStatus,
  PostStatus,
  Queue,
  RankTier,
  Role,
} from '../../../core/api/models/enums';
import type { DuoApplication, DuoPost } from '../../../core/api/models/duo-post.model';
import type { PublicProfile } from '../../../core/api/models/profile.model';
import type { Contact } from '../../../core/api/models/common.model';
import { DuoPostsService } from '../../../core/api/duo-posts.service';
import { AuthService } from '../../../core/auth/auth.service';
import {
  DIVISION_LABEL_KEYS,
  QUEUE_LABEL_KEYS,
  RANK_LABEL_KEYS,
  ROLE_LABEL_KEYS,
} from '../../../core/i18n/labels';
import { I18nService } from '../../../core/i18n/i18n.service';
import type { TranslationKey } from '../../../core/i18n/translations';
import { PROFILE_RANK_TIERS, PROFILE_ROLES } from '../../../core/profile/profile-options';
import { ToastService } from '../../../core/toast/toast.service';
import { whatsappUrl } from '../../../core/utils/contact';
import { initialsOf } from '../../../core/utils/labels';
import { CountryBadgeComponent } from '../../../shared/icons/country-badge.component';
import { RankIconComponent } from '../../../shared/icons/rank-icon.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog.component';
import { EmailVerificationBannerComponent } from '../../../shared/ui/email-verification-banner.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton.component';

type Tab = 'explore' | 'mine';

interface AcceptedContact extends Contact {
  username: string;
}

const APPLICATION_STATUS_META: Record<
  ApplicationStatus,
  { key: TranslationKey; className: string }
> = {
  pending: {
    key: 'posts.statusPending',
    className: 'border-gold/40 bg-gold/10 text-gold',
  },
  accepted: {
    key: 'posts.statusAccepted',
    className: 'border-success/40 bg-success/10 text-success',
  },
  rejected: {
    key: 'posts.statusRejected',
    className: 'border-danger/40 bg-danger/10 text-danger',
  },
  withdrawn: {
    key: 'posts.statusWithdrawn',
    className: 'border-border bg-surface-2 text-muted',
  },
};

const POST_STATUS_META: Record<PostStatus, { key: TranslationKey; className: string }> = {
  active: {
    key: 'posts.postActive',
    className: 'border-success/40 bg-success/10 text-success',
  },
  filled: {
    key: 'posts.postFilled',
    className: 'border-accent/40 bg-accent/10 text-accent',
  },
  expired: {
    key: 'posts.postExpired',
    className: 'border-border bg-surface-2 text-muted',
  },
  cancelled: {
    key: 'posts.postCancelled',
    className: 'border-border bg-surface-2 text-muted',
  },
};

@Component({
  selector: 'app-duo-posts-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonComponent,
    CardComponent,
    ConfirmDialogComponent,
    EmailVerificationBannerComponent,
    CountryBadgeComponent,
    RankIconComponent,
    SkeletonComponent,
  ],
  template: `
    <div class="grid gap-5">
      <header>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {{ i18n.t('posts.eyebrow') }}
        </p>
        <h1 class="mt-2 text-2xl font-extrabold sm:text-3xl">{{ i18n.t('posts.title') }}</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {{ i18n.t('posts.description') }}
        </p>
      </header>

      <app-email-verification-banner />

      @if (!canInteract()) {
        <app-card padding="lg">
          <h2 class="text-lg font-bold">{{ i18n.t('posts.needsAccountTitle') }}</h2>
          <p class="mt-2 text-sm text-muted">{{ i18n.t('posts.needsAccountBody') }}</p>
          <div class="mt-4 flex flex-col gap-3 sm:flex-row">
            @if (!user()?.profileCompleted) {
              <app-button routerLink="/onboarding">{{
                i18n.t('match.completeProfile')
              }}</app-button>
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
      } @else {
        @if (accepted(); as contact) {
          <section class="rounded-2xl border border-success/40 bg-success/10 p-5">
            <p class="text-xs font-bold uppercase tracking-wide text-success">
              {{ i18n.t('posts.acceptedContact') }}
            </p>
            <h2 class="mt-1 text-lg font-bold">{{ contact.username }}</h2>
            <div class="mt-3 grid gap-2 sm:grid-cols-2">
              <button
                type="button"
                (click)="copy('matches.riotId', contact.riotId)"
                class="flex items-center justify-between gap-2 rounded-xl border border-border bg-bg px-4 py-3 text-left"
              >
                <span>
                  <span class="block text-[11px] text-muted">{{ i18n.t('matches.riotId') }}</span>
                  <span class="text-sm font-semibold">{{ contact.riotId }}</span>
                </span>
                <span class="text-xs font-bold text-accent">{{ i18n.t('posts.copy') }}</span>
              </button>
              @if (contact.discordTag) {
                <button
                  type="button"
                  (click)="copy('matches.discord', contact.discordTag)"
                  class="flex items-center justify-between gap-2 rounded-xl border border-border bg-bg px-4 py-3 text-left"
                >
                  <span>
                    <span class="block text-[11px] text-muted">
                      {{ i18n.t('matches.discord') }}
                    </span>
                    <span class="text-sm font-semibold">{{ contact.discordTag }}</span>
                  </span>
                  <span class="text-xs font-bold text-accent">{{ i18n.t('posts.copy') }}</span>
                </button>
              }
              @if (contact.whatsapp) {
                <a
                  [href]="whatsappUrl(contact.whatsapp)"
                  target="_blank"
                  rel="noreferrer"
                  class="flex items-center justify-between gap-2 rounded-xl border border-border bg-bg px-4 py-3 text-left"
                >
                  <span>
                    <span class="block text-[11px] text-muted">
                      {{ i18n.t('matches.whatsapp') }}
                    </span>
                    <span class="text-sm font-semibold">{{ contact.whatsapp }}</span>
                  </span>
                </a>
              }
            </div>
            <a
              routerLink="/matches"
              class="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-accent hover:underline"
            >
              {{ i18n.t('posts.seeMatches') }}
            </a>
          </section>
        }

        <div
          class="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex flex-wrap gap-2">
            @for (option of tabOptions; track option.value) {
              <button
                type="button"
                (click)="tab.set(option.value)"
                class="min-h-11 rounded-xl px-4 py-2.5 text-xs font-bold transition"
                [class.bg-accent]="tab() === option.value"
                [class.text-bg]="tab() === option.value"
                [class.border]="tab() !== option.value"
                [class.border-border]="tab() !== option.value"
                [class.text-muted]="tab() !== option.value"
              >
                {{ i18n.t(option.labelKey) }}
              </button>
            }
          </div>

          <app-button
            [variant]="formOpen() ? 'secondary' : 'primary'"
            [disabled]="creating()"
            (click)="toggleForm()"
          >
            {{ formOpen() ? i18n.t('posts.closeForm') : i18n.t('posts.newPost') }}
          </app-button>
        </div>

        @if (formOpen()) {
          <app-card padding="lg">
            <h2 class="text-lg font-bold">{{ i18n.t('posts.newPost') }}</h2>
            <form class="mt-4 grid gap-4" (submit)="createPost($event)">
              <div class="grid gap-3 sm:grid-cols-2">
                <label class="grid gap-1.5 text-xs font-semibold text-muted">
                  {{ i18n.t('posts.queue') }}
                  <select
                    [value]="formQueue()"
                    (change)="setFormQueue($event)"
                    class="min-h-11 rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text"
                  >
                    @for (queue of queueOptions; track queue) {
                      <option [value]="queue">{{ i18n.t(QUEUE_LABEL_KEYS[queue]) }}</option>
                    }
                  </select>
                </label>

                <div>
                  <p class="text-xs font-semibold text-muted">{{ i18n.t('posts.roleNeeded') }}</p>
                  <div class="mt-2 flex flex-wrap gap-2">
                    @for (role of roleOptions; track role) {
                      <button
                        type="button"
                        (click)="toggleFormRole(role)"
                        [class]="choiceClass(formRoles().includes(role))"
                      >
                        {{ i18n.t(ROLE_LABEL_KEYS[role]) }}
                      </button>
                    }
                  </div>
                </div>
              </div>

              <div class="grid gap-3 sm:grid-cols-2">
                <label class="grid gap-1.5 text-xs font-semibold text-muted">
                  {{ i18n.t('posts.rankMin') }}
                  <select
                    [value]="formRankMin()"
                    (change)="setFormRankMin($event)"
                    class="min-h-11 rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text"
                  >
                    @for (tier of rankOptions; track tier) {
                      <option [value]="tier">{{ i18n.t(RANK_LABEL_KEYS[tier]) }}</option>
                    }
                  </select>
                </label>
                <label class="grid gap-1.5 text-xs font-semibold text-muted">
                  {{ i18n.t('posts.rankMax') }}
                  <select
                    [value]="formRankMax()"
                    (change)="setFormRankMax($event)"
                    class="min-h-11 rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text"
                  >
                    @for (tier of rankOptions; track tier) {
                      <option [value]="tier">{{ i18n.t(RANK_LABEL_KEYS[tier]) }}</option>
                    }
                  </select>
                </label>
              </div>

              <label class="grid gap-1.5 text-xs font-semibold text-muted">
                {{ i18n.t('posts.note') }}
                <textarea
                  [value]="formNote()"
                  (input)="setFormNote($event)"
                  maxlength="140"
                  rows="2"
                  [placeholder]="i18n.t('posts.notePlaceholder')"
                  class="resize-none rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-muted/60"
                ></textarea>
              </label>

              <div class="flex flex-wrap gap-2">
                <app-button type="submit" [loading]="creating()">
                  {{ creating() ? i18n.t('posts.creating') : i18n.t('posts.create') }}
                </app-button>
                <app-button variant="secondary" (click)="formOpen.set(false)">
                  {{ i18n.t('report.cancel') }}
                </app-button>
              </div>
            </form>
          </app-card>
        }

        @if (error()) {
          <p class="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
            {{ error() }}
          </p>
        }

        @if (tab() === 'explore') {
          <section>
            <div class="mb-4 flex flex-wrap items-center justify-end gap-2">
              <select
                [value]="filterQueue()"
                (change)="setFilterQueue($event)"
                class="min-h-11 rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text"
              >
                <option value="">{{ i18n.t('posts.allQueues') }}</option>
                @for (queue of queueOptions; track queue) {
                  <option [value]="queue">{{ i18n.t(QUEUE_LABEL_KEYS[queue]) }}</option>
                }
              </select>
              <select
                [value]="filterRole()"
                (change)="setFilterRole($event)"
                class="min-h-11 rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text"
              >
                <option value="">{{ i18n.t('posts.allRoles') }}</option>
                @for (role of roleOptions; track role) {
                  <option [value]="role">{{ i18n.t(ROLE_LABEL_KEYS[role]) }}</option>
                }
              </select>
              <app-button variant="secondary" size="sm" [loading]="loading()" (click)="loadPosts()">
                {{ i18n.t('posts.reload') }}
              </app-button>
            </div>

            @if (loading()) {
              <div class="grid gap-4">
                <app-skeleton variant="card" />
                <app-skeleton variant="card" />
              </div>
            } @else if (posts().length) {
              <div class="grid gap-4">
                @for (post of posts(); track post.id) {
                  <article class="rounded-2xl border border-border bg-surface p-5">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div class="flex min-w-0 items-center gap-3">
                        <div
                          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-sm font-extrabold text-accent"
                        >
                          {{ initials(post.owner.username) }}
                        </div>
                        <div class="min-w-0">
                          <h2 class="truncate font-bold">&#64;{{ post.owner.username }}</h2>
                          <p class="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted">
                            <app-rank-icon
                              [tier]="rankTierForQueue(post.owner, post.queue)"
                              [size]="16"
                            />
                            <span class="truncate">
                              {{ rankLabel(post.owner, post.queue) }} ·
                              {{ profileRolesLabel(post.owner) }}
                            </span>
                          </p>
                          @if (post.owner.country) {
                            <p class="mt-0.5 text-[10px] text-muted">
                              <app-country-badge [country]="post.owner.country" />
                            </p>
                          }
                        </div>
                      </div>
                      <span
                        class="rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-muted"
                      >
                        {{ i18n.t('posts.expires', { minutes: minutesLeft(post.expiresAt) }) }}
                      </span>
                    </div>

                    <div class="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-muted">
                      <span class="rounded-full border border-border px-2 py-1">
                        {{ i18n.t(QUEUE_LABEL_KEYS[post.queue]) }}
                      </span>
                      <span class="rounded-full border border-border px-2 py-1">
                        {{ i18n.t('posts.rolesNeeded', { roles: rolesLabel(post.rolesNeeded) }) }}
                      </span>
                      <span class="rounded-full border border-border px-2 py-1">
                        {{
                          i18n.t('posts.rankRange', {
                            min: i18n.t(RANK_LABEL_KEYS[post.rankMinTier]),
                            max: i18n.t(RANK_LABEL_KEYS[post.rankMaxTier]),
                          })
                        }}
                      </span>
                    </div>

                    @if (post.note) {
                      <p
                        class="mt-3 rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-muted"
                      >
                        "{{ post.note }}"
                      </p>
                    }

                    @if (post.myApplicationStatus) {
                      <p
                        class="mt-4 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-xs font-semibold text-muted"
                      >
                        {{
                          i18n.t('posts.applicationStatus', {
                            status: i18n.t(applicationStatusMeta(post.myApplicationStatus).key),
                          })
                        }}
                      </p>
                    } @else {
                      <div class="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
                        <input
                          [value]="applyDraft(post.id)"
                          (input)="setApplyDraft(post.id, $event)"
                          maxlength="140"
                          [placeholder]="i18n.t('posts.applicationPlaceholder')"
                          class="min-h-11 rounded-xl border border-border bg-bg px-3 py-2.5 text-xs text-text placeholder:text-muted/60"
                        />
                        <app-button
                          size="sm"
                          [loading]="applyingId() === post.id"
                          (click)="apply(post)"
                        >
                          {{ i18n.t('posts.apply') }}
                        </app-button>
                      </div>
                    }
                  </article>
                }
              </div>
            } @else {
              <app-card padding="lg">
                <div class="py-6 text-center">
                  <h2 class="font-bold">{{ i18n.t('posts.emptyExploreTitle') }}</h2>
                  <p class="mx-auto mt-2 max-w-md text-sm text-muted">
                    {{ i18n.t('posts.emptyExploreBody') }}
                  </p>
                </div>
              </app-card>
            }
          </section>
        } @else {
          <section>
            @if (mineLoading()) {
              <div class="grid gap-4">
                <app-skeleton variant="card" />
                <app-skeleton variant="card" />
              </div>
            } @else if (mine().length) {
              <div class="grid gap-4">
                @for (post of mine(); track post.id) {
                  <article class="rounded-2xl border border-border bg-surface p-5">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p class="text-xs font-semibold uppercase tracking-wide text-accent">
                          {{ i18n.t(QUEUE_LABEL_KEYS[post.queue]) }}
                        </p>
                        <h2 class="mt-1 text-lg font-bold">
                          {{ i18n.t('posts.rolesNeeded', { roles: rolesLabel(post.rolesNeeded) }) }}
                        </h2>
                        <p class="mt-1 text-xs text-muted">
                          {{
                            i18n.t('posts.rankRange', {
                              min: i18n.t(RANK_LABEL_KEYS[post.rankMinTier]),
                              max: i18n.t(RANK_LABEL_KEYS[post.rankMaxTier]),
                            })
                          }}
                        </p>
                      </div>
                      <span
                        class="rounded-full border px-3 py-1 text-[11px] font-semibold"
                        [class]="postStatusMeta(post).className"
                      >
                        {{ i18n.t(postStatusMeta(post).key) }}
                      </span>
                    </div>

                    @if (post.note) {
                      <p class="mt-3 text-sm text-muted">{{ post.note }}</p>
                    }

                    <div class="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-muted">
                      <span class="rounded-full border border-border px-2 py-1">
                        {{ i18n.t('posts.applications', { count: post.applicationsCount ?? 0 }) }}
                      </span>
                      <span class="rounded-full border border-border px-2 py-1">
                        {{
                          i18n.t('posts.pendingApplications', {
                            count: post.pendingApplicationsCount ?? 0,
                          })
                        }}
                      </span>
                      <span class="rounded-full border border-border px-2 py-1">
                        {{ i18n.t('posts.expires', { minutes: minutesLeft(post.expiresAt) }) }}
                      </span>
                    </div>

                    <div class="mt-4 flex flex-wrap gap-2">
                      <app-button
                        variant="secondary"
                        size="sm"
                        [loading]="applicationsLoading() && expandedPostId() === post.id"
                        (click)="toggleApplications(post.id)"
                      >
                        {{
                          expandedPostId() === post.id
                            ? i18n.t('posts.hideApplications')
                            : i18n.t('posts.viewApplications')
                        }}
                      </app-button>
                      @if (post.status === 'active') {
                        <app-button
                          variant="danger"
                          size="sm"
                          [disabled]="actionId() === post.id"
                          (click)="cancelTarget.set(post)"
                        >
                          {{ i18n.t('posts.cancelPost') }}
                        </app-button>
                      }
                    </div>

                    @if (expandedPostId() === post.id) {
                      <div class="mt-4 grid gap-3 border-t border-border pt-4">
                        @if (applicationsFor(post.id).length) {
                          @for (application of applicationsFor(post.id); track application.id) {
                            <div class="rounded-xl border border-border bg-bg p-4">
                              <div class="flex flex-wrap items-start justify-between gap-3">
                                <div class="flex min-w-0 items-center gap-3">
                                  <div
                                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-extrabold text-accent"
                                  >
                                    {{ initials(application.applicant.username) }}
                                  </div>
                                  <div class="min-w-0">
                                    <p class="truncate text-sm font-bold">
                                      &#64;{{ application.applicant.username }}
                                    </p>
                                    <p class="text-[11px] text-muted">
                                      {{ rankLabel(application.applicant, post.queue) }} ·
                                      {{ profileRolesLabel(application.applicant) }}
                                      @if (application.score !== undefined) {
                                        · {{ application.score }} pts
                                      }
                                    </p>
                                  </div>
                                </div>
                                <span
                                  class="rounded-full border px-2 py-1 text-[10px] font-semibold"
                                  [class]="applicationStatusMeta(application.status).className"
                                >
                                  {{ i18n.t(applicationStatusMeta(application.status).key) }}
                                </span>
                              </div>

                              @if (application.message) {
                                <p class="mt-3 text-sm text-muted">"{{ application.message }}"</p>
                              }

                              @if (application.status === 'pending') {
                                <div class="mt-3 flex flex-wrap gap-2">
                                  <app-button
                                    size="sm"
                                    [loading]="actionId() === application.id"
                                    (click)="acceptApplication(post, application)"
                                  >
                                    {{ i18n.t('posts.accept') }}
                                  </app-button>
                                  <app-button
                                    variant="danger"
                                    size="sm"
                                    [disabled]="actionId() === application.id"
                                    (click)="rejectApplication(post, application)"
                                  >
                                    {{ i18n.t('posts.reject') }}
                                  </app-button>
                                </div>
                              }
                            </div>
                          }
                        } @else {
                          <p class="text-sm text-muted">{{ i18n.t('posts.noApplications') }}</p>
                        }
                      </div>
                    }
                  </article>
                }
              </div>
            } @else {
              <app-card padding="lg">
                <div class="py-6 text-center">
                  <h2 class="font-bold">{{ i18n.t('posts.emptyMineTitle') }}</h2>
                  <p class="mx-auto mt-2 max-w-md text-sm text-muted">
                    {{ i18n.t('posts.emptyMineBody') }}
                  </p>
                </div>
              </app-card>
            }
          </section>
        }
      }

      <app-confirm-dialog
        [open]="cancelTarget() !== null"
        [title]="i18n.t('posts.cancelTitle')"
        [message]="i18n.t('posts.cancelMessage')"
        [confirmLabel]="i18n.t('posts.cancelPost')"
        [cancelLabel]="i18n.t('report.cancel')"
        [busy]="cancelBusy()"
        (closed)="closeCancelDialog()"
        (confirmed)="confirmCancel()"
      />
    </div>
  `,
})
export class DuoPostsPage implements OnInit {
  private readonly duoPosts = inject(DuoPostsService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly i18n = inject(I18nService);

  protected readonly whatsappUrl = whatsappUrl;
  protected readonly ROLE_LABEL_KEYS = ROLE_LABEL_KEYS;
  protected readonly QUEUE_LABEL_KEYS = QUEUE_LABEL_KEYS;
  protected readonly RANK_LABEL_KEYS = RANK_LABEL_KEYS;
  protected readonly roleOptions = PROFILE_ROLES;
  protected readonly rankOptions = PROFILE_RANK_TIERS;
  protected readonly queueOptions: Queue[] = ['solo_duo', 'flex'];
  protected readonly tabOptions: { value: Tab; labelKey: TranslationKey }[] = [
    { value: 'explore', labelKey: 'posts.explore' },
    { value: 'mine', labelKey: 'posts.mine' },
  ];

  protected readonly user = this.auth.user;
  protected readonly canInteract = computed(() =>
    Boolean(this.user()?.emailVerified && this.user()?.profileCompleted),
  );

  protected readonly tab = signal<Tab>('explore');
  protected readonly posts = signal<DuoPost[]>([]);
  protected readonly mine = signal<DuoPost[]>([]);
  protected readonly applications = signal<Record<string, DuoApplication[]>>({});
  protected readonly expandedPostId = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly mineLoading = signal(true);
  protected readonly applicationsLoading = signal(false);
  protected readonly error = signal('');
  protected readonly filterQueue = signal<Queue | ''>('');
  protected readonly filterRole = signal<Role | ''>('');
  protected readonly formOpen = signal(false);
  protected readonly formQueue = signal<Queue>('solo_duo');
  protected readonly formRoles = signal<Role[]>(['support']);
  protected readonly formRankMin = signal<RankTier>('gold');
  protected readonly formRankMax = signal<RankTier>('platinum');
  protected readonly formNote = signal('');
  protected readonly creating = signal(false);
  protected readonly applyDrafts = signal<Record<string, string>>({});
  protected readonly applyingId = signal<string | null>(null);
  protected readonly actionId = signal<string | null>(null);
  protected readonly accepted = signal<AcceptedContact | null>(null);
  protected readonly cancelTarget = signal<DuoPost | null>(null);
  protected readonly nowTick = signal(Date.now());

  private readonly timer = setInterval(() => this.nowTick.set(Date.now()), 30_000);

  constructor() {
    this.destroyRef.onDestroy(() => clearInterval(this.timer));
  }

  ngOnInit(): void {
    this.loadPosts();
    this.loadMine();
  }

  protected initials(username: string | null | undefined): string {
    return initialsOf(username);
  }

  protected minutesLeft(value: string): number {
    const diff = new Date(value).getTime() - this.nowTick();
    return Math.max(0, Math.ceil(diff / 60_000));
  }

  protected rolesLabel(roles: Role[]): string {
    return roles.map((role) => this.i18n.t(ROLE_LABEL_KEYS[role])).join(' / ');
  }

  protected profileRolesLabel(profile: PublicProfile): string {
    return `${this.i18n.t(ROLE_LABEL_KEYS[profile.primaryRole])} / ${this.i18n.t(
      ROLE_LABEL_KEYS[profile.secondaryRole],
    )}`;
  }

  protected rankTierForQueue(profile: PublicProfile, queue: Queue): RankTier {
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

  protected applicationStatusMeta(status: ApplicationStatus): {
    key: TranslationKey;
    className: string;
  } {
    return APPLICATION_STATUS_META[status];
  }

  protected postStatusMeta(post: DuoPost): { key: TranslationKey; className: string } {
    return POST_STATUS_META[post.status];
  }

  protected applicationsFor(postId: string): DuoApplication[] {
    return this.applications()[postId] ?? [];
  }

  protected applyDraft(postId: string): string {
    return this.applyDrafts()[postId] ?? '';
  }

  protected setApplyDraft(postId: string, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.applyDrafts.update((drafts) => ({ ...drafts, [postId]: value }));
  }

  protected choiceClass(selected: boolean): string {
    return `min-h-11 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
      selected
        ? 'border-accent bg-accent/15 text-accent'
        : 'border-border text-muted hover:border-accent/50'
    }`;
  }

  protected toggleForm(): void {
    this.formOpen.update((open) => !open);
  }

  protected setFormQueue(event: Event): void {
    this.formQueue.set((event.target as HTMLSelectElement).value as Queue);
  }

  protected setFormRankMin(event: Event): void {
    this.formRankMin.set((event.target as HTMLSelectElement).value as RankTier);
  }

  protected setFormRankMax(event: Event): void {
    this.formRankMax.set((event.target as HTMLSelectElement).value as RankTier);
  }

  protected setFormNote(event: Event): void {
    this.formNote.set((event.target as HTMLTextAreaElement).value);
  }

  protected toggleFormRole(role: Role): void {
    const current = this.formRoles();
    if (current.includes(role)) {
      this.formRoles.set(current.filter((item) => item !== role));
      return;
    }
    if (current.length >= 2) return;
    this.formRoles.set([...current, role]);
  }

  protected setFilterQueue(event: Event): void {
    this.filterQueue.set((event.target as HTMLSelectElement).value as Queue | '');
    this.loadPosts();
  }

  protected setFilterRole(event: Event): void {
    this.filterRole.set((event.target as HTMLSelectElement).value as Role | '');
    this.loadPosts();
  }

  protected createPost(event: Event): void {
    event.preventDefault();

    if (!this.formRoles().length) {
      this.toast.error(this.i18n.t('posts.needRole'));
      return;
    }

    if (
      this.rankOptions.indexOf(this.formRankMin()) > this.rankOptions.indexOf(this.formRankMax())
    ) {
      this.toast.error(this.i18n.t('posts.needRankRange'));
      return;
    }

    this.creating.set(true);
    this.error.set('');

    this.duoPosts
      .create({
        queue: this.formQueue(),
        rolesNeeded: this.formRoles(),
        rankMinTier: this.formRankMin(),
        rankMaxTier: this.formRankMax(),
        note: this.formNote().trim() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.creating.set(false);
          this.formOpen.set(false);
          this.formNote.set('');
          this.toast.success(this.i18n.t('posts.created'));
          this.loadPosts();
          this.loadMine();
        },
        error: () => {
          this.creating.set(false);
          this.toast.error(this.i18n.t('posts.createError'));
        },
      });
  }

  protected apply(post: DuoPost): void {
    this.applyingId.set(post.id);

    this.duoPosts
      .apply(post.id, {
        message: this.applyDraft(post.id).trim() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.applyingId.set(null);
          this.posts.update((posts) =>
            posts.map((item) =>
              item.id === post.id ? { ...item, myApplicationStatus: 'pending' } : item,
            ),
          );
          this.toast.success(this.i18n.t('posts.applied'));
        },
        error: () => {
          this.applyingId.set(null);
          this.toast.error(this.i18n.t('posts.applyError'));
        },
      });
  }

  protected toggleApplications(postId: string): void {
    if (this.expandedPostId() === postId) {
      this.expandedPostId.set(null);
      return;
    }

    this.expandedPostId.set(postId);
    this.applicationsLoading.set(true);

    this.duoPosts
      .getApplications(postId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.applicationsLoading.set(false);
          this.applications.update((current) => ({
            ...current,
            [postId]: response.applications,
          }));
        },
        error: () => {
          this.applicationsLoading.set(false);
          this.expandedPostId.set(null);
          this.toast.error(this.i18n.t('posts.applicationsLoadError'));
        },
      });
  }

  protected acceptApplication(post: DuoPost, application: DuoApplication): void {
    this.actionId.set(application.id);

    this.duoPosts
      .acceptApplication(post.id, application.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.actionId.set(null);
          this.accepted.set({
            username: application.applicant.username,
            ...response.contact,
          });
          this.applications.update((current) => ({
            ...current,
            [post.id]: (current[post.id] ?? []).map((item) => {
              if (item.id === application.id) return { ...item, status: 'accepted' };
              if (item.status === 'pending') return { ...item, status: 'rejected' };
              return item;
            }),
          }));
          this.mine.update((posts) =>
            posts.map((item) => (item.id === post.id ? { ...item, status: 'filled' } : item)),
          );
          this.toast.success(this.i18n.t('posts.accepted'));
          this.loadMine();
          this.loadPosts();
        },
        error: () => {
          this.actionId.set(null);
          this.toast.error(this.i18n.t('posts.acceptError'));
        },
      });
  }

  protected rejectApplication(post: DuoPost, application: DuoApplication): void {
    this.actionId.set(application.id);

    this.duoPosts
      .rejectApplication(post.id, application.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionId.set(null);
          this.applications.update((current) => ({
            ...current,
            [post.id]: (current[post.id] ?? []).map((item) =>
              item.id === application.id ? { ...item, status: 'rejected' } : item,
            ),
          }));
          this.toast.success(this.i18n.t('posts.rejected'));
        },
        error: () => {
          this.actionId.set(null);
          this.toast.error(this.i18n.t('posts.rejectError'));
        },
      });
  }

  protected closeCancelDialog(): void {
    if (this.actionId()) return;
    this.cancelTarget.set(null);
  }

  protected cancelBusy(): boolean {
    const post = this.cancelTarget();
    return post !== null && this.actionId() === post.id;
  }

  protected confirmCancel(): void {
    const post = this.cancelTarget();
    if (!post) return;

    this.actionId.set(post.id);

    this.duoPosts
      .cancel(post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionId.set(null);
          this.cancelTarget.set(null);
          this.mine.update((posts) =>
            posts.map((item) => (item.id === post.id ? { ...item, status: 'cancelled' } : item)),
          );
          this.posts.update((posts) => posts.filter((item) => item.id !== post.id));
          this.toast.success(this.i18n.t('posts.cancelledToast'));
        },
        error: () => {
          this.actionId.set(null);
          this.cancelTarget.set(null);
          this.toast.error(this.i18n.t('posts.cancelError'));
        },
      });
  }

  protected async copy(labelKey: TranslationKey, value: string | null): Promise<void> {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      this.toast.success(this.i18n.t('posts.copied', { label: this.i18n.t(labelKey) }));
    } catch {
      this.toast.error(this.i18n.t('posts.copyError'));
    }
  }

  protected loadPosts(): void {
    if (!this.canInteract()) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.duoPosts
      .list({
        ...(this.filterQueue() ? { queue: this.filterQueue() as Queue } : {}),
        ...(this.filterRole() ? { role: this.filterRole() as Role } : {}),
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.posts.set(response.posts);
        },
        error: () => {
          this.loading.set(false);
          this.posts.set([]);
          this.error.set(this.i18n.t('posts.loadError'));
        },
      });
  }

  private loadMine(): void {
    if (!this.canInteract()) {
      this.mineLoading.set(false);
      return;
    }

    this.mineLoading.set(true);

    this.duoPosts
      .getMine()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.mineLoading.set(false);
          this.mine.set(response.posts);
        },
        error: () => {
          this.mineLoading.set(false);
          this.mine.set([]);
          this.error.set(this.i18n.t('posts.mineLoadError'));
        },
      });
  }
}
