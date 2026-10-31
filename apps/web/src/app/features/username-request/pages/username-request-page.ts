import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RESERVED_USERNAMES } from '@duolan/shared/constants';
import { toUserMessage } from '../../../core/api/api-error';
import type { UsernameChangeRequest } from '../../../core/api/models/profile.model';
import { ProfilesService } from '../../../core/api/profiles.service';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import type { TranslationKey } from '../../../core/i18n/translations';
import { formatDate } from '../../../core/utils/time';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';
import { TextInputComponent } from '../../../shared/ui/text-input.component';

const STATUS_META: Record<
  UsernameChangeRequest['status'],
  { key: TranslationKey; className: string }
> = {
  pending_user: {
    key: 'username.pendingUser',
    className: 'border-gold/40 bg-gold/10 text-gold',
  },
  pending_admin: {
    key: 'username.pendingAdmin',
    className: 'border-accent/40 bg-accent/10 text-accent',
  },
  approved: {
    key: 'username.approved',
    className: 'border-success/40 bg-success/10 text-success',
  },
  rejected: {
    key: 'username.rejected',
    className: 'border-danger/40 bg-danger/10 text-danger',
  },
};

@Component({
  selector: 'app-username-request-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, TextInputComponent],
  template: `
    <div class="grid gap-5">
      <app-card padding="lg">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          {{ i18n.t('username.eyebrow') }}
        </p>
        <h1 class="mt-2 text-2xl font-extrabold sm:text-3xl">{{ i18n.t('username.title') }}</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          {{ i18n.t('username.description', { name: currentUsername() }) }}
        </p>
      </app-card>

      @if (loading()) {
        <div class="flex min-h-[40vh] items-center justify-center">
          <div
            class="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent"
          ></div>
        </div>
      } @else {
        @if (errorMessage()) {
          <p class="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {{ errorMessage() }}
          </p>
        }

        @if (!request()) {
          <app-card padding="lg">
            <h2 class="text-lg font-bold">{{ i18n.t('username.noRequestTitle') }}</h2>
            <p class="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              {{ i18n.t('username.noRequestBody') }}
            </p>
          </app-card>
        } @else if (request(); as request) {
          <app-card padding="lg">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-bold">{{ i18n.t('username.yourRequest') }}</h2>
                <p class="text-xs text-muted">
                  {{ i18n.t('username.createdOn', { date: formatDate(request.createdAt) }) }}
                </p>
              </div>
              <span
                [class]="
                  'rounded-full border px-3 py-1 text-xs font-bold ' + statusMeta(request).className
                "
              >
                {{ i18n.t(statusMeta(request).key) }}
              </span>
            </div>

            @if (request.adminNote) {
              <p
                class="mt-4 rounded-xl border border-border bg-bg p-4 text-sm leading-relaxed text-muted"
              >
                {{ request.adminNote }}
              </p>
            }

            @if (request.status === 'pending_user') {
              <form class="mt-5 grid gap-4" (submit)="submit($event, request)" novalidate>
                <app-text-input
                  [formControl]="username"
                  [label]="i18n.t('username.newLabel')"
                  [hint]="i18n.t('username.hint')"
                  autocomplete="username"
                  [error]="usernameError()"
                />
                <div>
                  <app-button type="submit" [loading]="submitting()">
                    {{ submitting() ? i18n.t('username.sending') : i18n.t('username.submit') }}
                  </app-button>
                </div>
              </form>
            }

            @if (request.status === 'pending_admin') {
              <div class="mt-5 rounded-xl border border-border bg-bg p-4 text-sm text-muted">
                {{ i18n.t('username.proposed', { name: request.suggestedUsername ?? '' }) }}
              </div>
            }

            @if (request.status === 'approved') {
              <div
                class="mt-5 rounded-xl border border-success/40 bg-success/10 p-4 text-sm text-success"
              >
                {{ i18n.t('username.approvedMessage', { name: request.suggestedUsername ?? '' }) }}
              </div>
            }

            @if (request.status === 'rejected') {
              <div
                class="mt-5 rounded-xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger"
              >
                {{ i18n.t('username.rejectedMessage') }}
                @if (request.resolutionNote) {
                  {{ request.resolutionNote }}
                }
              </div>
            }

            <button
              type="button"
              (click)="load()"
              class="mt-5 inline-flex min-h-11 items-center text-xs font-semibold text-muted transition hover:text-text"
            >
              {{ i18n.t('username.refresh') }}
            </button>
          </app-card>
        }
      }
    </div>
  `,
})
export class UsernameRequestPage {
  private readonly profiles = inject(ProfilesService);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly i18n = inject(I18nService);

  protected readonly request = signal<UsernameChangeRequest | null>(null);
  protected readonly currentUsername = signal('');
  protected readonly loading = signal(true);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly username = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^[\p{L}\p{N}_]{3,20}$/u)],
  });

  constructor() {
    this.load();
  }

  protected formatDate = formatDate;

  protected load(): void {
    this.loading.set(true);
    this.errorMessage.set('');

    this.profiles
      .getUsernameChange()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.request.set(response.request);
          this.currentUsername.set(response.currentUsername);
          this.loading.set(false);
          if (response.request?.status === 'approved') {
            this.auth.refreshProfile().subscribe({ error: () => undefined });
          }
        },
        error: (error: unknown) => {
          this.loading.set(false);
          this.errorMessage.set(toUserMessage(error) || this.i18n.t('username.loadError'));
        },
      });
  }

  protected usernameError(): string {
    if (!this.username.touched) return '';
    return this.username.invalid ? this.i18n.t('username.invalid') : '';
  }

  protected statusMeta(request: UsernameChangeRequest) {
    return STATUS_META[request.status];
  }

  protected submit(event: Event, request: UsernameChangeRequest): void {
    event.preventDefault();
    this.username.markAsTouched();

    if (this.username.invalid) {
      this.errorMessage.set(this.i18n.t('username.invalid'));
      return;
    }

    const value = this.username.value.trim();
    if (RESERVED_USERNAMES.includes(value.toLowerCase())) {
      this.errorMessage.set(this.i18n.t('username.reserved'));
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.profiles
      .suggestUsername(request.id, value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.username.reset('');
          this.load();
        },
        error: (error: unknown) => {
          this.submitting.set(false);
          this.errorMessage.set(toUserMessage(error) || this.i18n.t('username.sendError'));
        },
      });
  }
}
