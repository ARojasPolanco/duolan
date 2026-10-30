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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuthShellComponent } from '../../../shared/layout/auth-shell.component';
import { ButtonComponent } from '../../../shared/ui/button.component';

type VerifyStatus = 'loading' | 'success' | 'error' | 'missing';

@Component({
  selector: 'app-verify-email-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AuthShellComponent, ButtonComponent],
  template: `
    <app-auth-shell [title]="i18n.t('verify.title')" [subtitle]="i18n.t('verify.subtitle')">
      <div class="space-y-5 text-center">
        <div
          class="mx-auto flex h-14 w-14 items-center justify-center rounded-full border text-lg font-bold"
          [class]="statusClasses()"
        >
          @if (status() === 'success') {
            ✓
          } @else if (status() === 'error' || status() === 'missing') {
            !
          } @else {
            …
          }
        </div>

        <p class="text-sm leading-relaxed text-muted">{{ message() }}</p>

        @if (status() === 'success' && user()) {
          <a
            [routerLink]="destination()"
            class="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-bold text-bg"
          >
            {{ i18n.t('verify.continue') }}
          </a>
        }

        @if (status() === 'success' && !user()) {
          <a
            routerLink="/login"
            class="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-5 text-sm font-bold text-bg"
          >
            {{ i18n.t('common.login') }}
          </a>
        }

        @if (status() === 'error' && user()) {
          <div class="flex flex-col justify-center gap-2 sm:flex-row">
            <app-button variant="secondary" [loading]="resending()" (click)="resendVerification()">
              {{ resending() ? i18n.t('verify.resending') : i18n.t('verify.resend') }}
            </app-button>
            <a
              routerLink="/inicio"
              class="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold text-muted"
            >
              {{ i18n.t('verify.goAccount') }}
            </a>
          </div>
        }

        @if (status() === 'missing') {
          <a
            routerLink="/login"
            class="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold text-muted"
          >
            {{ i18n.t('verify.backLogin') }}
          </a>
        }

        @if (resendMessage()) {
          <p class="text-xs text-success">{{ resendMessage() }}</p>
        }
      </div>
    </app-auth-shell>
  `,
})
export class VerifyEmailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly i18n = inject(I18nService);

  protected readonly status = signal<VerifyStatus>('loading');
  protected readonly resending = signal(false);
  protected readonly resendMessage = signal('');
  protected readonly user = this.auth.user;

  protected readonly destination = computed(() =>
    this.user()?.profileCompleted ? '/inicio' : '/onboarding',
  );

  protected readonly statusClasses = computed(() => {
    if (this.status() === 'success') return 'border-success/40 bg-success/10 text-success';
    if (this.status() === 'error' || this.status() === 'missing') {
      return 'border-danger/40 bg-danger/10 text-danger';
    }
    return 'border-accent/40 bg-accent/10 text-accent';
  });

  protected readonly message = computed(() => {
    switch (this.status()) {
      case 'success':
        return this.i18n.t('verify.success');
      case 'error':
        return this.i18n.t('verify.error');
      case 'missing':
        return this.i18n.t('verify.missingToken');
      default:
        return this.i18n.t('verify.checking');
    }
  });

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.status.set('missing');
      return;
    }

    this.auth
      .verifyEmail(token)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.status.set('success');
          if (this.auth.isAuthenticated()) {
            this.auth.refreshProfile().subscribe({
              error: () => undefined,
            });
          }
        },
        error: () => this.status.set('error'),
      });
  }

  protected resendVerification(): void {
    this.resending.set(true);
    this.resendMessage.set('');

    this.auth
      .resendVerification()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resending.set(false);
          this.resendMessage.set(this.i18n.t('verify.resent'));
        },
        error: () => {
          this.resending.set(false);
          this.resendMessage.set(this.i18n.t('verify.resendError'));
        },
      });
  }
}
