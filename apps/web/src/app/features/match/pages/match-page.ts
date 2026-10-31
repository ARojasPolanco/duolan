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
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import type { Queue, Role } from '../../../core/api/models/enums';
import type { Candidate, OutgoingLike } from '../../../core/api/models/matching.model';
import type { PublicProfile } from '../../../core/api/models/profile.model';
import { MatchingService } from '../../../core/api/matching.service';
import { TrustService } from '../../../core/api/trust.service';
import { AuthService } from '../../../core/auth/auth.service';
import {
  DIVISION_LABEL_KEYS,
  QUEUE_LABEL_KEYS,
  RANK_LABEL_KEYS,
  ROLE_LABEL_KEYS,
} from '../../../core/i18n/labels';
import { I18nService } from '../../../core/i18n/i18n.service';
import { MatchingStore } from '../../../core/matching/matching.store';
import { PROFILE_ROLES } from '../../../core/profile/profile-options';
import { ToastService } from '../../../core/toast/toast.service';
import { PlayerPreviewCardComponent } from '../../../shared/cards/player-preview-card.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog.component';
import { EmailVerificationBannerComponent } from '../../../shared/ui/email-verification-banner.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton.component';

@Component({
  selector: 'app-match-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ButtonComponent,
    CardComponent,
    ConfirmDialogComponent,
    EmailVerificationBannerComponent,
    PlayerPreviewCardComponent,
    SkeletonComponent,
  ],
  template: `
    <div class="grid gap-5">
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            {{ i18n.t('match.eyebrow') }}
          </p>
          <h1 class="mt-2 text-2xl font-extrabold sm:text-3xl">{{ i18n.t('match.title') }}</h1>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {{ i18n.t('match.description') }}
          </p>
        </div>
        <a
          routerLink="/como-funciona"
          class="inline-flex min-h-11 items-center rounded-lg border border-border px-3 text-xs font-semibold text-muted transition hover:border-accent/50 hover:text-text"
        >
          {{ i18n.t('match.howItWorks') }}
        </a>
      </header>

      @if (!user()?.emailVerified) {
        <app-email-verification-banner />
      }

      @if (!canInteract()) {
        <app-card padding="lg">
          <h2 class="text-lg font-bold">{{ i18n.t('match.needsAccountTitle') }}</h2>
          <p class="mt-2 text-sm text-muted">{{ i18n.t('match.needsAccountBody') }}</p>
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
        <section
          class="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex flex-wrap gap-2">
            @for (option of queues; track option) {
              <button
                type="button"
                (click)="setQueue(option)"
                class="rounded-lg px-4 py-2 text-xs font-bold transition"
                [class.bg-accent]="queue() === option"
                [class.text-bg]="queue() === option"
                [class.border]="queue() !== option"
                [class.border-border]="queue() !== option"
                [class.text-muted]="queue() !== option"
              >
                {{ i18n.t(QUEUE_LABEL_KEYS[option]) }}
              </button>
            }
          </div>

          <div class="flex items-center gap-2">
            <select
              [value]="role()"
              (change)="setRoleFromEvent($event)"
              class="min-h-11 rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text"
              [attr.aria-label]="i18n.t('onboarding.primaryRole')"
            >
              <option value="">{{ i18n.t('match.allRoles') }}</option>
              @for (option of roles; track option) {
                <option [value]="option">{{ i18n.t(ROLE_LABEL_KEYS[option]) }}</option>
              }
            </select>
            <app-button
              variant="secondary"
              size="sm"
              [loading]="loading()"
              (click)="load()"
              [attr.aria-label]="i18n.t('match.reload')"
            >
              {{ i18n.t('match.reload') }}
            </app-button>
            <span
              class="hidden rounded-full border border-border px-2 py-1 text-xs text-muted sm:inline"
            >
              {{ i18n.t('match.candidates') }}: {{ candidates().length }}
            </span>
          </div>
        </section>

        @if (error()) {
          <p class="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
            {{ error() }}
          </p>
        }

        @if (loading()) {
          <div class="grid gap-4 md:grid-cols-2">
            <app-skeleton variant="card" />
            <app-skeleton variant="card" />
          </div>
        } @else if (!error() && candidates().length === 0) {
          <app-card padding="lg">
            <div class="py-6 text-center">
              <h2 class="mt-3 text-lg font-bold">{{ i18n.t('match.noCandidatesTitle') }}</h2>
              <p class="mx-auto mt-2 max-w-md text-sm text-muted">
                {{ i18n.t('match.noCandidatesBody') }}
              </p>
              <app-button class="mt-4" variant="secondary" routerLink="/perfil">
                {{ i18n.t('match.editProfile') }}
              </app-button>
            </div>
          </app-card>
        } @else {
          <div class="grid gap-4 md:grid-cols-2">
            @for (candidate of candidates(); track candidate.profile.id) {
              <app-player-preview-card
                [player]="candidate.profile"
                [queue]="queue()"
                [score]="candidate.score"
                [reasons]="candidate.reasons"
                [showPass]="true"
                [busy]="actionId() === candidate.profile.id"
                (like)="like(candidate)"
                (pass)="pass(candidate)"
                (block)="block(candidate)"
              />
            }
          </div>
        }

        @if (outgoing().length) {
          <app-card padding="lg">
            <div class="flex items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-bold">{{ i18n.t('match.outgoingTitle') }}</h2>
                <p class="text-xs text-muted">{{ i18n.t('match.outgoingBody') }}</p>
              </div>
              <span class="rounded-full border border-border px-2 py-1 text-xs text-muted">
                {{ outgoing().length }}
              </span>
            </div>

            <div class="mt-4 grid gap-2 sm:grid-cols-2">
              @for (item of outgoing(); track item.id) {
                <div
                  class="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg px-3 py-2.5"
                >
                  <div class="min-w-0">
                    <p class="truncate text-sm font-semibold">&#64;{{ item.target.username }}</p>
                    <p class="truncate text-[11px] text-muted">
                      {{ rankLabel(item.target) }} · {{ rolesLabel(item.target) }}
                    </p>
                  </div>
                  <app-button
                    variant="danger"
                    size="sm"
                    [disabled]="actionId() === item.target.id"
                    (click)="unlike(item.target.id)"
                  >
                    {{ i18n.t('match.unlike') }}
                  </app-button>
                </div>
              }
            </div>
          </app-card>
        }
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
export class MatchPage implements OnInit {
  private readonly matchingApi = inject(MatchingService);
  private readonly trust = inject(TrustService);
  private readonly auth = inject(AuthService);
  private readonly matchingStore = inject(MatchingStore);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly i18n = inject(I18nService);

  protected readonly QUEUE_LABEL_KEYS = QUEUE_LABEL_KEYS;
  protected readonly ROLE_LABEL_KEYS = ROLE_LABEL_KEYS;
  protected readonly queues: Queue[] = ['solo_duo', 'flex'];
  protected readonly roles = PROFILE_ROLES;
  protected readonly user = this.auth.user;

  protected readonly queue = signal<Queue>('solo_duo');
  protected readonly role = signal<Role | ''>('');
  protected readonly candidates = signal<Candidate[]>([]);
  protected readonly outgoing = signal<OutgoingLike[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly actionId = signal<string | null>(null);
  protected readonly pendingBlock = signal<Candidate | null>(null);

  protected readonly canInteract = computed(() =>
    Boolean(this.user()?.emailVerified && this.user()?.profileCompleted),
  );

  ngOnInit(): void {
    this.load();
    this.loadOutgoing();
    const timer = setInterval(() => {
      if (document.visibilityState === 'visible') this.load();
    }, 60_000);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  protected setQueue(queue: Queue): void {
    this.queue.set(queue);
    this.load();
  }

  protected setRoleFromEvent(event: Event): void {
    const role = (event.target as HTMLSelectElement).value as Role | '';
    this.role.set(role);
    this.load();
  }

  protected load(): void {
    if (!this.canInteract()) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.matchingApi
      .getCandidates({ queue: this.queue(), ...(this.role() ? { role: this.role() as Role } : {}) })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.candidates.set(response.candidates);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.error.set(this.i18n.t('match.loadError'));
        },
      });
  }

  private loadOutgoing(): void {
    if (!this.canInteract()) {
      this.outgoing.set([]);
      return;
    }

    this.matchingApi
      .getOutgoingLikes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.outgoing.set(response.outgoing),
        error: () => this.outgoing.set([]),
      });
  }

  protected like(candidate: Candidate): void {
    const snapshot = this.candidates();
    this.removeCandidate(candidate.profile.id);
    this.actionId.set(candidate.profile.id);

    this.matchingApi
      .like(candidate.profile.id)
      .pipe(
        finalize(() => this.actionId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (response) => {
          if (response.matched) {
            this.toast.success(this.i18n.t('match.matchCreated'));
            this.matchingStore.refresh();
            void this.router.navigate(['/matches']);
            return;
          }

          this.toast.success(this.i18n.t('match.likeSent'));
          this.loadOutgoing();
          this.matchingStore.refresh();
        },
        error: () => {
          this.candidates.set(snapshot);
          this.toast.error(this.i18n.t('match.likeError'));
        },
      });
  }

  protected pass(candidate: Candidate): void {
    this.removeCandidate(candidate.profile.id);
  }

  protected unlike(targetUserId: string): void {
    this.actionId.set(targetUserId);

    this.matchingApi
      .unlike(targetUserId)
      .pipe(
        finalize(() => this.actionId.set(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.outgoing.update((items) => items.filter((item) => item.target.id !== targetUserId));
          this.toast.success(this.i18n.t('match.unlikeSent'));
          this.load();
          this.matchingStore.refresh();
        },
        error: () => this.toast.error(this.i18n.t('match.unlikeError')),
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
          this.outgoing.update((items) =>
            items.filter((item) => item.target.id !== candidate.profile.id),
          );
          this.pendingBlock.set(null);
          this.toast.success(this.i18n.t('match.blocked'));
          this.matchingStore.refresh();
        },
        error: () => {
          this.pendingBlock.set(null);
          this.toast.error(this.i18n.t('match.blockError'));
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

  private removeCandidate(userId: string): void {
    this.candidates.update((items) => items.filter((item) => item.profile.id !== userId));
  }
}
