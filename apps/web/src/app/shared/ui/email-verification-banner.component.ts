import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import { ToastService } from '../../core/toast/toast.service';
import { ButtonComponent } from '../ui/button.component';

@Component({
  selector: 'app-email-verification-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    @if (show()) {
      <div
        class="flex flex-col gap-3 rounded-2xl border border-gold/40 bg-gold/10 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p class="text-sm font-bold text-gold">{{ i18n.t('verify.bannerTitle') }}</p>
          <p class="mt-1 text-xs leading-relaxed text-gold/90">
            {{ i18n.t('verify.bannerBody') }}
          </p>
        </div>
        <app-button variant="secondary" size="sm" [loading]="resending()" (click)="resend()">
          {{ resending() ? i18n.t('verify.resending') : i18n.t('verify.resend') }}
        </app-button>
      </div>
    }
  `,
})
export class EmailVerificationBannerComponent {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(ToastService);
  protected readonly i18n = inject(I18nService);

  protected readonly resending = signal(false);
  protected readonly show = computed(
    () => Boolean(this.auth.user()) && this.auth.user()?.emailVerified === false,
  );

  protected resend(): void {
    this.resending.set(true);

    this.auth
      .resendVerification()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.resending.set(false);
          this.toast.success(this.i18n.t('verify.resent'));
        },
        error: () => {
          this.resending.set(false);
          this.toast.error(this.i18n.t('verify.resendError'));
        },
      });
  }
}
