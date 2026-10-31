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
import type { ApplicationStatus } from '../../../core/api/models/enums';
import type {
  AramApplication,
  AramMineResponse,
  AramPost,
} from '../../../core/api/models/aram.model';
import { AramService } from '../../../core/api/aram.service';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import type { TranslationKey } from '../../../core/i18n/translations';
import { ToastService } from '../../../core/toast/toast.service';
import { initialsOf } from '../../../core/utils/labels';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog.component';
import { EmailVerificationBannerComponent } from '../../../shared/ui/email-verification-banner.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton.component';

type AramTab = 'group' | 'solo';
type AramAction = 'accept' | 'reject';

const APPLICATION_STATUS_KEYS: Record<ApplicationStatus, TranslationKey> = {
  pending: 'aram.statusPending',
  accepted: 'aram.statusAccepted',
  rejected: 'aram.statusRejected',
  withdrawn: 'aram.statusWithdrawn',
};

@Component({
  selector: 'app-aram-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonComponent,
    CardComponent,
    ConfirmDialogComponent,
    EmailVerificationBannerComponent,
    SkeletonComponent,
  ],
  template: `
    <div class="grid gap-5">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            {{ i18n.t('aram.eyebrow') }}
          </p>
          <h1 class="mt-2 text-2xl font-extrabold sm:text-3xl">{{ i18n.t('aram.title') }}</h1>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {{ i18n.t('aram.description') }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <a
            routerLink="/como-funciona"
            class="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-semibold text-muted transition hover:border-accent/50 hover:text-text"
          >
            {{ i18n.t('aram.howItWorks') }}
          </a>
          <app-button variant="secondary" size="sm" [loading]="loading()" (click)="load()">
            {{ i18n.t('aram.reload') }}
          </app-button>
        </div>
      </header>

      <app-email-verification-banner />

      @if (!canInteract()) {
        <app-card padding="lg">
          <h2 class="text-lg font-bold">{{ i18n.t('aram.needsAccountTitle') }}</h2>
          <p class="mt-2 text-sm text-muted">{{ i18n.t('aram.needsAccountBody') }}</p>
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
        <div class="flex gap-2 overflow-x-auto pb-1">
          @for (option of tabOptions; track option.value) {
            <button
              type="button"
              (click)="setTab(option.value)"
              [class]="tabClass(tab() === option.value)"
            >
              {{ i18n.t(option.labelKey) }}
            </button>
          }
        </div>

        @if (loading()) {
          <div class="grid gap-3">
            <app-skeleton variant="card" />
            <app-skeleton variant="card" />
          </div>
        } @else {
          @if (mine().post; as post) {
            <section class="rounded-2xl border border-accent/40 bg-surface p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    {{ i18n.t('aram.yourPost') }}
                  </p>
                  <h2 class="mt-1 text-lg font-bold">{{ postModeLabel(post) }}</h2>
                  <p class="mt-1 text-xs text-muted">
                    {{ windowLabel(post) }} · {{ micLabel(post) }}
                    @if (post.note) {
                      · {{ post.note }}
                    }
                  </p>
                </div>
                <app-button variant="danger" size="sm" (click)="closeTarget.set(true)">
                  {{ i18n.t('aram.closePost') }}
                </app-button>
              </div>

              <div class="mt-5 grid gap-3">
                <p class="text-sm font-semibold">
                  {{
                    i18n.t('aram.receivedApplications', {
                      count: mine().applications.length,
                    })
                  }}
                </p>

                @if (mine().applications.length) {
                  @for (application of mine().applications; track application.id) {
                    <div
                      class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg p-3"
                    >
                      <div class="flex min-w-0 items-center gap-3">
                        <span
                          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-xs font-extrabold text-accent"
                        >
                          {{ initials(application.applicant?.username) }}
                        </span>
                        <div class="min-w-0">
                          <p class="truncate text-sm font-semibold">
                            &#64;{{ application.applicant?.username }}
                          </p>
                          <p class="text-[11px] text-muted">
                            {{ i18n.t(applicationStatusKey(application.status)) }}
                            @if (application.message) {
                              · {{ application.message }}
                            }
                          </p>
                        </div>
                      </div>
                      @if (application.status === 'pending') {
                        <div class="flex gap-2">
                          <app-button
                            size="sm"
                            [loading]="busyId() === application.id"
                            (click)="respond(application.id, 'accept')"
                          >
                            {{ i18n.t('posts.accept') }}
                          </app-button>
                          <app-button
                            variant="danger"
                            size="sm"
                            [disabled]="busyId() === application.id"
                            (click)="respond(application.id, 'reject')"
                          >
                            {{ i18n.t('posts.reject') }}
                          </app-button>
                        </div>
                      }
                    </div>
                  }
                } @else {
                  <p class="rounded-xl border border-border bg-bg px-4 py-5 text-sm text-muted">
                    {{ i18n.t('aram.noApplications') }}
                  </p>
                }
              </div>
            </section>
          } @else {
            <app-card padding="lg">
              <h2 class="text-lg font-bold">
                {{ tab() === 'solo' ? i18n.t('aram.goAvailable') : i18n.t('aram.publishGroup') }}
              </h2>
              <p class="mt-1 text-sm text-muted">
                {{
                  tab() === 'solo'
                    ? i18n.t('aram.goAvailableBody')
                    : i18n.t('aram.publishGroupBody')
                }}
              </p>

              <form class="mt-5 grid gap-4" (submit)="createPost($event)">
                @if (tab() === 'group') {
                  <div class="grid gap-4 sm:grid-cols-2">
                    <label class="grid gap-1.5 text-xs font-semibold text-muted">
                      {{ i18n.t('aram.playersPresent') }}
                      <select
                        [value]="formPlayersPresent()"
                        (change)="setPlayersPresent($event)"
                        class="min-h-11 rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text"
                      >
                        @for (value of playersPresentOptions; track value) {
                          <option [value]="value">
                            {{ i18n.t('aram.playersCount', { count: value }) }}
                          </option>
                        }
                      </select>
                    </label>
                    <label class="grid gap-1.5 text-xs font-semibold text-muted">
                      {{ i18n.t('aram.slotsNeeded') }}
                      <select
                        [value]="formSlotsNeeded()"
                        (change)="setSlotsNeeded($event)"
                        class="min-h-11 rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text"
                      >
                        @for (value of slotOptions(); track value) {
                          <option [value]="value">
                            {{
                              value === 1
                                ? i18n.t('aram.slotsCount', { count: value })
                                : i18n.t('aram.slotsCountPlural', { count: value })
                            }}
                          </option>
                        }
                      </select>
                    </label>
                  </div>
                }

                <div>
                  <p class="mb-2 text-xs font-semibold text-muted">{{ i18n.t('aram.when') }}</p>
                  <div class="grid grid-cols-2 gap-2">
                    @for (option of windowOptions; track option.value) {
                      <button
                        type="button"
                        (click)="formWindow.set(option.value)"
                        [class]="choiceClass(formWindow() === option.value)"
                      >
                        {{ i18n.t(option.labelKey) }}
                      </button>
                    }
                  </div>
                </div>

                <div>
                  <p class="mb-2 text-xs font-semibold text-muted">{{ i18n.t('aram.mic') }}</p>
                  <div class="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      (click)="formHasMic.set(true)"
                      [class]="choiceClass(formHasMic())"
                    >
                      {{ i18n.t('aram.withMic') }}
                    </button>
                    <button
                      type="button"
                      (click)="formHasMic.set(false)"
                      [class]="choiceClass(!formHasMic())"
                    >
                      {{ i18n.t('aram.withoutMic') }}
                    </button>
                  </div>
                </div>

                <label class="grid gap-1.5 text-xs font-semibold text-muted">
                  {{ i18n.t('aram.note') }}
                  <textarea
                    [value]="formNote()"
                    (input)="setNote($event)"
                    maxlength="140"
                    rows="2"
                    [placeholder]="i18n.t('aram.notePlaceholder')"
                    class="resize-none rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-text placeholder:text-muted/60"
                  ></textarea>
                </label>

                <div>
                  <app-button type="submit" [loading]="submitting()">
                    {{
                      submitting()
                        ? i18n.t('aram.publishing')
                        : tab() === 'solo'
                          ? i18n.t('aram.goAvailable')
                          : i18n.t('aram.publish')
                    }}
                  </app-button>
                </div>
              </form>
            </app-card>
          }

          <section>
            <div class="mb-3">
              <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                {{ tab() === 'solo' ? i18n.t('aram.availableNow') : i18n.t('aram.groupsLooking') }}
              </p>
              <h2 class="mt-1 text-xl font-extrabold">
                {{ tab() === 'solo' ? i18n.t('aram.peopleForAram') : i18n.t('aram.joinGroup') }}
              </h2>
            </div>

            @if (posts().length) {
              <div class="grid gap-3">
                @for (post of posts(); track post.id) {
                  <article class="rounded-2xl border border-border bg-surface p-5">
                    <div class="flex flex-wrap items-start justify-between gap-3">
                      <div class="flex min-w-0 items-center gap-3">
                        <span
                          class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-sm font-extrabold text-accent"
                        >
                          {{ initials(post.owner.username) }}
                        </span>
                        <div class="min-w-0">
                          <p class="truncate font-bold">&#64;{{ post.owner.username }}</p>
                          <p class="mt-1 text-sm text-muted">{{ postModeLabel(post) }}</p>
                          <p class="mt-1 text-[11px] text-muted">
                            {{ windowLabel(post) }} · {{ micLabel(post) }}
                          </p>
                        </div>
                      </div>

                      @if (post.myApplicationStatus === 'pending') {
                        <span
                          class="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[10px] font-bold text-accent"
                        >
                          {{ i18n.t('aram.requestSent') }}
                        </span>
                      } @else if (post.myApplicationStatus === 'accepted') {
                        <span
                          class="rounded-full border border-success/40 bg-success/10 px-3 py-1 text-[10px] font-bold text-success"
                        >
                          {{ i18n.t('aram.accepted') }}
                        </span>
                      } @else {
                        <app-button
                          size="sm"
                          [loading]="busyId() === post.id"
                          (click)="apply(post)"
                        >
                          {{
                            post.mode === 'solo' ? i18n.t('aram.invite') : i18n.t('aram.sumarme')
                          }}
                        </app-button>
                      }
                    </div>

                    @if (post.note) {
                      <p
                        class="mt-3 rounded-xl border border-border bg-bg px-4 py-3 text-sm text-muted"
                      >
                        {{ post.note }}
                      </p>
                    }

                    @if (post.myApplicationStatus === 'accepted') {
                      <a
                        routerLink="/matches"
                        class="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-accent hover:underline"
                      >
                        {{ i18n.t('aram.viewContact') }}
                      </a>
                    }
                  </article>
                }
              </div>
            } @else {
              <app-card padding="lg">
                <div class="py-6 text-center">
                  <h3 class="font-bold">{{ i18n.t('aram.noPosts') }}</h3>
                  <p class="mx-auto mt-2 max-w-md text-sm text-muted">
                    {{ i18n.t('aram.noPostsBody') }}
                  </p>
                </div>
              </app-card>
            }
          </section>

          <section>
            <h2 class="text-lg font-bold">{{ i18n.t('aram.myApplications') }}</h2>
            @if (mine().myApplications.length) {
              <div class="mt-3 grid gap-2">
                @for (application of mine().myApplications; track application.id) {
                  @if (application.post; as post) {
                    <div
                      class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface p-4"
                    >
                      <div>
                        <p class="text-sm font-semibold">
                          &#64;{{ post.owner.username }} · {{ postModeLabel(post) }}
                        </p>
                        <p class="mt-1 text-xs text-muted">
                          {{ i18n.t(applicationStatusKey(application.status)) }} ·
                          {{ windowLabel(post) }}
                        </p>
                      </div>
                      @if (application.status === 'pending') {
                        <app-button
                          variant="secondary"
                          size="sm"
                          [loading]="busyId() === application.id"
                          (click)="withdraw(application)"
                        >
                          {{ i18n.t('aram.withdraw') }}
                        </app-button>
                      } @else if (application.status === 'accepted') {
                        <a
                          routerLink="/matches"
                          class="text-xs font-semibold text-accent hover:underline"
                        >
                          {{ i18n.t('aram.viewContact') }}
                        </a>
                      }
                    </div>
                  }
                }
              </div>
            } @else {
              <p
                class="mt-3 rounded-xl border border-border bg-surface px-4 py-5 text-sm text-muted"
              >
                {{ i18n.t('aram.noMyApplications') }}
              </p>
            }
          </section>
        }
      }

      <app-confirm-dialog
        [open]="closeTarget()"
        [title]="i18n.t('aram.closeTitle')"
        [message]="i18n.t('aram.closeMessage')"
        [confirmLabel]="i18n.t('aram.confirmClose')"
        [cancelLabel]="i18n.t('report.cancel')"
        [busy]="cancelBusy()"
        (closed)="closeCancelDialog()"
        (confirmed)="confirmCancel()"
      />
    </div>
  `,
})
export class AramPage implements OnInit {
  private readonly aram = inject(AramService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly i18n = inject(I18nService);

  protected readonly tabOptions: { value: AramTab; labelKey: TranslationKey }[] = [
    { value: 'group', labelKey: 'aram.groupTab' },
    { value: 'solo', labelKey: 'aram.soloTab' },
  ];
  protected readonly windowOptions: { value: 'now' | 'tonight'; labelKey: TranslationKey }[] = [
    { value: 'now', labelKey: 'aram.windowNow' },
    { value: 'tonight', labelKey: 'aram.windowTonight' },
  ];
  protected readonly playersPresentOptions = [2, 3, 4];

  protected readonly user = this.auth.user;
  protected readonly canInteract = computed(() =>
    Boolean(this.user()?.emailVerified && this.user()?.profileCompleted),
  );

  protected readonly tab = signal<AramTab>('group');
  protected readonly posts = signal<AramPost[]>([]);
  protected readonly mine = signal<AramMineResponse>({
    status: 'success',
    post: null,
    applications: [],
    myApplications: [],
  });
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly busyId = signal<string | null>(null);
  protected readonly error = signal('');
  protected readonly closeTarget = signal(false);
  protected readonly formPlayersPresent = signal(2);
  protected readonly formSlotsNeeded = signal(1);
  protected readonly formWindow = signal<'now' | 'tonight'>('now');
  protected readonly formHasMic = signal(false);
  protected readonly formNote = signal('');

  protected readonly slotOptions = computed(() =>
    Array.from({ length: Math.max(1, 5 - this.formPlayersPresent()) }, (_, index) => index + 1),
  );

  ngOnInit(): void {
    this.load();
  }

  protected initials(username: string | null | undefined): string {
    return initialsOf(username);
  }

  protected postModeLabel(post: AramPost): string {
    return post.mode === 'solo'
      ? this.i18n.t('aram.modeSolo')
      : this.i18n.t('aram.modeGroup', {
          present: post.playersPresent,
          slots: post.slotsNeeded,
        });
  }

  protected windowLabel(post: AramPost): string {
    return this.i18n.t(post.window === 'tonight' ? 'aram.windowTonight' : 'aram.windowNow');
  }

  protected micLabel(post: AramPost): string {
    return this.i18n.t(post.hasMic ? 'aram.withMic' : 'aram.withoutMic');
  }

  protected applicationStatusKey(status: ApplicationStatus): TranslationKey {
    return APPLICATION_STATUS_KEYS[status];
  }

  protected tabClass(selected: boolean): string {
    return `min-h-11 shrink-0 rounded-full border px-4 py-2.5 text-xs font-semibold transition ${
      selected
        ? 'border-accent bg-accent/15 text-accent'
        : 'border-border text-muted hover:border-accent/50'
    }`;
  }

  protected choiceClass(selected: boolean): string {
    return `min-h-11 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
      selected
        ? 'border-accent bg-accent/15 text-accent'
        : 'border-border bg-bg text-muted hover:border-accent/50'
    }`;
  }

  protected setTab(tab: AramTab): void {
    this.tab.set(tab);
    this.error.set('');
    this.load();
  }

  protected setPlayersPresent(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.formPlayersPresent.set(value);
    const maxSlots = Math.max(1, 5 - value);
    if (this.formSlotsNeeded() > maxSlots) this.formSlotsNeeded.set(maxSlots);
  }

  protected setSlotsNeeded(event: Event): void {
    this.formSlotsNeeded.set(Number((event.target as HTMLSelectElement).value));
  }

  protected setNote(event: Event): void {
    this.formNote.set((event.target as HTMLTextAreaElement).value);
  }

  protected createPost(event: Event): void {
    event.preventDefault();

    if (this.mine().post) return;

    this.submitting.set(true);
    this.error.set('');

    this.aram
      .create({
        mode: this.tab(),
        playersPresent: this.tab() === 'solo' ? 1 : this.formPlayersPresent(),
        slotsNeeded: this.tab() === 'solo' ? 1 : this.formSlotsNeeded(),
        window: this.formWindow(),
        hasMic: this.formHasMic(),
        note: this.formNote().trim() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.formNote.set('');
          this.toast.success(
            this.i18n.t(this.tab() === 'solo' ? 'aram.createdSolo' : 'aram.createdGroup'),
          );
          this.load();
        },
        error: () => {
          this.submitting.set(false);
          this.toast.error(this.i18n.t('aram.createError'));
        },
      });
  }

  protected apply(post: AramPost): void {
    this.busyId.set(post.id);

    this.aram
      .apply(post.id, {})
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyId.set(null);
          this.toast.success(
            this.i18n.t(post.mode === 'solo' ? 'aram.inviteSent' : 'aram.applySent'),
          );
          this.load();
        },
        error: () => {
          this.busyId.set(null);
          this.toast.error(this.i18n.t('aram.applyError'));
        },
      });
  }

  protected respond(applicationId: string, action: AramAction): void {
    const post = this.mine().post;
    if (!post) return;

    this.busyId.set(applicationId);

    const request =
      action === 'accept'
        ? this.aram.acceptApplication(post.id, applicationId)
        : this.aram.rejectApplication(post.id, applicationId);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.busyId.set(null);
        this.toast.success(
          this.i18n.t(action === 'accept' ? 'aram.acceptedToast' : 'aram.rejectedToast'),
        );
        this.load();
      },
      error: () => {
        this.busyId.set(null);
        this.toast.error(
          this.i18n.t(action === 'accept' ? 'aram.acceptError' : 'aram.rejectError'),
        );
      },
    });
  }

  protected withdraw(application: AramApplication): void {
    const post = application.post;
    if (!post) return;

    this.busyId.set(application.id);

    this.aram
      .withdrawApplication(post.id, application.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyId.set(null);
          this.toast.success(this.i18n.t('aram.withdrawnToast'));
          this.load();
        },
        error: () => {
          this.busyId.set(null);
          this.toast.error(this.i18n.t('aram.withdrawError'));
        },
      });
  }

  protected closeCancelDialog(): void {
    if (this.busyId()) return;
    this.closeTarget.set(false);
  }

  protected cancelBusy(): boolean {
    const post = this.mine().post;
    return post !== null && this.busyId() === post.id;
  }

  protected confirmCancel(): void {
    const post = this.mine().post;
    if (!post) return;

    this.busyId.set(post.id);

    this.aram
      .cancel(post.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.busyId.set(null);
          this.closeTarget.set(false);
          this.toast.success(this.i18n.t('aram.cancelledToast'));
          this.load();
        },
        error: () => {
          this.busyId.set(null);
          this.closeTarget.set(false);
          this.toast.error(this.i18n.t('aram.cancelError'));
        },
      });
  }

  protected load(): void {
    if (!this.canInteract()) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set('');

    Promise.all([this.aram.list({ mode: this.tab() }).toPromise(), this.aram.getMine().toPromise()])
      .then(([list, mine]) => {
        this.posts.set(list?.posts ?? []);
        this.mine.set(
          mine ?? {
            status: 'success',
            post: null,
            applications: [],
            myApplications: [],
          },
        );
        this.loading.set(false);
      })
      .catch(() => {
        this.loading.set(false);
        this.posts.set([]);
        this.error.set(this.i18n.t('aram.loadError'));
      });
  }
}
