import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuthShellComponent } from '../../../shared/layout/auth-shell.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { TextInputComponent } from '../../../shared/ui/text-input.component';

@Component({
  selector: 'app-forgot-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthShellComponent,
    ButtonComponent,
    TextInputComponent,
  ],
  template: `
    <app-auth-shell [title]="i18n.t('forgot.title')" [subtitle]="i18n.t('forgot.subtitle')">
      <form class="grid gap-4" (ngSubmit)="submit()" novalidate>
        @if (sent()) {
          <p
            class="rounded-xl border border-success/40 bg-success/10 px-3 py-2 text-xs text-success"
          >
            {{ i18n.t('forgot.sent') }}
          </p>
        }
        @if (errorMessage()) {
          <p class="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            {{ errorMessage() }}
          </p>
        }

        <app-text-input
          [formControl]="email"
          [label]="i18n.t('forgot.emailLabel')"
          type="email"
          autocomplete="email"
          [error]="emailError()"
        />

        <app-button type="submit" [fullWidth]="true" [loading]="submitting()">
          {{ submitting() ? i18n.t('forgot.sending') : i18n.t('forgot.submit') }}
        </app-button>
      </form>

      <div footer>
        <a routerLink="/login" class="font-semibold text-accent hover:underline">
          {{ i18n.t('forgot.backLogin') }}
        </a>
      </div>
    </app-auth-shell>
  `,
})
export class ForgotPasswordPage {
  private readonly auth = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly i18n = inject(I18nService);

  protected readonly email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email],
  });
  protected readonly submitting = signal(false);
  protected readonly sent = signal(false);
  protected readonly errorMessage = signal('');

  protected emailError(): string {
    if (!this.email.touched) return '';
    if (this.email.hasError('required')) return this.i18n.t('forgot.emailRequired');
    if (this.email.hasError('email')) return this.i18n.t('register.emailInvalid');
    return '';
  }

  protected submit(): void {
    if (this.email.invalid) {
      this.email.markAsTouched();
      return;
    }

    this.submitting.set(true);
    this.sent.set(false);
    this.errorMessage.set('');

    this.auth
      .forgotPassword(this.email.value.trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.sent.set(true);
        },
        error: () => {
          this.submitting.set(false);
          this.errorMessage.set(this.i18n.t('forgot.error'));
        },
      });
  }
}
