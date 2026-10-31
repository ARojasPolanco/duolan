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
import type { Contact } from '../../../core/api/models/common.model';
import type {
  Invite,
  InviteAcceptResponse,
  InviteBox,
} from '../../../core/api/models/invite.model';
import type { Queue } from '../../../core/api/models/enums';
import type { PublicProfile } from '../../../core/api/models/profile.model';
import { InvitesService } from '../../../core/api/invites.service';
import { AuthService } from '../../../core/auth/auth.service';
import {
  DIVISION_LABEL_KEYS,
  QUEUE_LABEL_KEYS,
  RANK_LABEL_KEYS,
  ROLE_LABEL_KEYS,
} from '../../../core/i18n/labels';
import { I18nService } from '../../../core/i18n/i18n.service';
import type { TranslationKey } from '../../../core/i18n/translations';
import { ToastService } from '../../../core/toast/toast.service';
import { whatsappUrl } from '../../../core/utils/contact';
import { initialsOf } from '../../../core/utils/labels';
import { formatDateTime } from '../../../core/utils/time';
import { CountryBadgeComponent } from '../../../shared/icons/country-badge.component';
import { RankIconComponent } from '../../../shared/icons/rank-icon.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';
import { EmailVerificationBannerComponent } from '../../../shared/ui/email-verification-banner.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton.component';

type InviteAction = 'accept' | 'decline' | 'cancel';

interface AcceptedContact extends Contact {
  username: string;
}

const STATUS_META: Record<Invite['status'], { key: TranslationKey; className: string }> = {
  pending: { key: 'invites.statusPending', className: 'border-gold/40 bg-gold/10 text-gold' },
  accepted: {
    key: 'invites.statusAccepted',
    className: 'border-success/40 bg-success/10 text-success',
  },
  declined: {
    key: 'invites.statusDeclined',
    className: 'border-danger/40 bg-danger/10 text-danger',
  },
  cancelled: {
    key: 'invites.statusCancelled',
    className: 'border-border bg-surface-2 text-muted',
  },
  expired: { key: 'invites.statusExpired', className: 'border-border bg-surface-2 text-muted' },
};

@Component({
  selector: 'app-invites-page',
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
          {{ i18n.t('invites.eyebrow') }}
        </p>
        <h1 class="mt-2 text-2xl font-extrabold sm:text-3xl">{{ i18n.t('invites.title') }}</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {{ i18n.t('invites.description') }}
        </p>
      </header>

      <app-email-verification-banner />

      @if (!canInteract()) {
        <app-card padding="lg">
          <h2 class="text-lg font-bold">{{ i18n.t('invites.needsAccountTitle') }}</h2>
          <p class="mt-2 text-sm text-muted">{{ i18n.t('invites.needsAccountBody') }}</p>
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
      } @else {
        @if (accepted(); as contact) {
          <section class="rounded-2xl border border-success/40 bg-success/10 p-5">
            <p class="text-xs font-bold uppercase tracking-wide text-success">
              {{ i18n.t('invites.contactRevealed') }}
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
                <span class="text-xs font-bold text-accent">{{ i18n.t('invites.copy') }}</span>
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
                  <span class="text-xs font-bold text-accent">
                    {{ i18n.t('invites.copy') }}
                  </span>
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
              {{ i18n.t('invites.seeInMatches') }}
            </a>
          </section>
        }

        <div class="flex gap-2">
          @for (option of boxOptions; track option.value) {
            <button
              type="button"
              (click)="setBox(option.value)"
              class="min-h-11 rounded-xl px-4 py-2.5 text-xs font-bold transition"
              [class.bg-accent]="box() === option.value"
              [class.text-bg]="box() === option.value"
              [class.border]="box() !== option.value"
              [class.border-border]="box() !== option.value"
              [class.text-muted]="box() !== option.value"
            >
              {{ i18n.t(option.labelKey) }}
            </button>
          }
        </div>

        @if (error()) {
          <p class="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
            {{ error() }}
          </p>
        }

        @if (loading()) {
          <div class="grid gap-3">
            <app-skeleton variant="card" />
            <app-skeleton variant="card" />
          </div>
        } @else if (invites().length) {
          <div class="grid gap-3">
            @for (invite of invites(); track invite.id) {
              <article class="rounded-2xl border border-border bg-surface p-5">
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div class="flex min-w-0 items-center gap-3">
                    <div
                      class="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-sm font-extrabold text-accent"
                    >
                      {{ initials(invite.counterpart.username) }}
                    </div>
                    <div class="min-w-0">
                      <h2 class="truncate font-bold">&#64;{{ invite.counterpart.username }}</h2>
                      <p class="mt-0.5 text-[10px] text-muted">
                        {{ i18n.t('match.usernameHint') }}
                      </p>
                      <p class="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted">
                        <app-rank-icon
                          [tier]="rankTierForQueue(invite.counterpart, invite.availability?.queue)"
                          [size]="16"
                        />
                        <span class="truncate">
                          {{ rankLabel(invite.counterpart, invite.availability?.queue) }} ·
                          {{ rolesLabel(invite.counterpart) }}
                        </span>
                      </p>
                      @if (invite.counterpart.country) {
                        <p class="mt-0.5 text-[10px] text-muted">
                          <app-country-badge [country]="invite.counterpart.country" />
                        </p>
                      }
                    </div>
                  </div>
                  <span
                    class="rounded-full border px-3 py-1 text-[11px] font-semibold"
                    [class]="statusMeta(invite).className"
                  >
                    {{ i18n.t(statusMeta(invite).key) }}
                  </span>
                </div>

                <div class="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-muted">
                  <span class="rounded-full border border-border px-2 py-1">
                    {{
                      i18n.t('invites.role', {
                        role: i18n.t(ROLE_LABEL_KEYS[invite.role]),
                      })
                    }}
                  </span>
                  @if (invite.availability) {
                    <span class="rounded-full border border-border px-2 py-1">
                      {{ i18n.t(QUEUE_LABEL_KEYS[invite.availability.queue]) }}
                    </span>
                  }
                  <span class="rounded-full border border-border px-2 py-1">
                    {{
                      invite.status === 'pending'
                        ? i18n.t('invites.expires', {
                            date: formatDate(invite.expiresAt),
                          })
                        : i18n.t('invites.created', {
                            date: formatDate(invite.createdAt),
                          })
                    }}
                  </span>
                </div>

                @if (invite.message) {
                  <p
                    class="mt-3 rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-muted"
                  >
                    "{{ invite.message }}"
                  </p>
                }

                <p class="mt-3 text-[11px] text-muted">{{ i18n.t('invites.contactHidden') }}</p>

                @if (invite.status === 'pending') {
                  <div class="mt-4 flex flex-wrap gap-2">
                    @if (box() === 'incoming') {
                      <app-button
                        size="sm"
                        [loading]="actionId() === invite.id"
                        (click)="respond(invite, 'accept')"
                      >
                        {{ i18n.t('invites.accept') }}
                      </app-button>
                      <app-button
                        variant="danger"
                        size="sm"
                        [disabled]="actionId() === invite.id"
                        (click)="respond(invite, 'decline')"
                      >
                        {{ i18n.t('invites.decline') }}
                      </app-button>
                    } @else {
                      <app-button
                        variant="secondary"
                        size="sm"
                        [loading]="actionId() === invite.id"
                        (click)="respond(invite, 'cancel')"
                      >
                        {{ i18n.t('invites.cancel') }}
                      </app-button>
                    }
                  </div>
                }
              </article>
            }
          </div>
        } @else {
          <app-card padding="lg">
            <div class="py-6 text-center">
              <h2 class="mt-3 font-bold">
                {{
                  box() === 'incoming'
                    ? i18n.t('invites.emptyIncomingTitle')
                    : i18n.t('invites.emptyOutgoingTitle')
                }}
              </h2>
              <p class="mx-auto mt-2 max-w-md text-sm text-muted">
                {{
                  box() === 'incoming'
                    ? i18n.t('invites.emptyIncomingBody')
                    : i18n.t('invites.emptyOutgoingBody')
                }}
              </p>
              <app-button class="mt-5" routerLink="/disponible">
                {{ i18n.t('invites.goAvailable') }}
              </app-button>
            </div>
          </app-card>
        }
      }
    </div>
  `,
})
export class InvitesPage implements OnInit {
  private readonly invitesApi = inject(InvitesService);
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly i18n = inject(I18nService);

  protected readonly ROLE_LABEL_KEYS = ROLE_LABEL_KEYS;
  protected readonly QUEUE_LABEL_KEYS = QUEUE_LABEL_KEYS;
  protected readonly boxOptions: { value: InviteBox; labelKey: TranslationKey }[] = [
    { value: 'incoming', labelKey: 'invites.incoming' },
    { value: 'outgoing', labelKey: 'invites.outgoing' },
  ];

  protected readonly user = this.auth.user;
  protected readonly canInteract = computed(() =>
    Boolean(this.user()?.emailVerified && this.user()?.profileCompleted),
  );
  protected readonly box = signal<InviteBox>('incoming');
  protected readonly invites = signal<Invite[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly actionId = signal<string | null>(null);
  protected readonly accepted = signal<AcceptedContact | null>(null);

  protected readonly whatsappUrl = whatsappUrl;

  ngOnInit(): void {
    this.load();
  }

  protected initials(username: string): string {
    return initialsOf(username);
  }

  protected formatDate(value: string): string {
    return formatDateTime(value, this.i18n.locale());
  }

  protected statusMeta(invite: Invite): { key: TranslationKey; className: string } {
    return STATUS_META[invite.status];
  }

  protected rankTierForQueue(profile: PublicProfile, queue: Queue | null | undefined) {
    return queue === 'flex' && profile.flexRankTier ? profile.flexRankTier : profile.rankTier;
  }

  protected rankLabel(profile: PublicProfile, queue: Queue | null | undefined): string {
    const tier = this.rankTierForQueue(profile, queue);
    const division =
      queue === 'flex' && profile.flexRankTier ? profile.flexRankDivision : profile.rankDivision;
    const tierLabel = this.i18n.t(RANK_LABEL_KEYS[tier]);
    const divisionLabel = division ? this.i18n.t(DIVISION_LABEL_KEYS[division]) : '';
    return divisionLabel ? `${tierLabel} ${divisionLabel}` : tierLabel;
  }

  protected rolesLabel(profile: PublicProfile): string {
    return `${this.i18n.t(ROLE_LABEL_KEYS[profile.primaryRole])} / ${this.i18n.t(
      ROLE_LABEL_KEYS[profile.secondaryRole],
    )}`;
  }

  protected setBox(box: InviteBox): void {
    this.box.set(box);
    this.load();
  }

  protected respond(invite: Invite, action: InviteAction): void {
    this.actionId.set(invite.id);

    const request =
      action === 'accept'
        ? this.invitesApi.accept(invite.id)
        : action === 'decline'
          ? this.invitesApi.decline(invite.id)
          : this.invitesApi.cancel(invite.id);

    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        this.actionId.set(null);

        if (action === 'accept' && 'contact' in response) {
          const contact = (response as InviteAcceptResponse).contact;
          this.accepted.set({
            username: invite.counterpart.username,
            ...contact,
          });
          this.toast.success(this.i18n.t('invites.toastAccepted'));
        } else {
          this.toast.success(
            this.i18n.t(action === 'decline' ? 'invites.toastDeclined' : 'invites.toastCancelled'),
          );
        }

        const nextStatus: Invite['status'] =
          action === 'accept' ? 'accepted' : action === 'decline' ? 'declined' : 'cancelled';

        this.invites.update((items) =>
          items.map((item) => (item.id === invite.id ? { ...item, status: nextStatus } : item)),
        );
      },
      error: () => {
        this.actionId.set(null);
        this.toast.error(this.i18n.t('invites.updateError'));
      },
    });
  }

  protected async copy(labelKey: TranslationKey, value: string | null): Promise<void> {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      this.toast.success(this.i18n.t('invites.toastCopied', { label: this.i18n.t(labelKey) }));
    } catch {
      this.toast.error(this.i18n.t('invites.toastCopyError'));
    }
  }

  private load(): void {
    if (!this.canInteract()) {
      this.loading.set(false);
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.invitesApi
      .list(this.box())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.invites.set(response.invites);
        },
        error: () => {
          this.loading.set(false);
          this.invites.set([]);
          this.error.set(this.i18n.t('invites.loadError'));
        },
      });
  }
}
