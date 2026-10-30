import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toUserMessage } from '../../../core/api/api-error';
import type { RegisterRequest } from '../../../core/api/models/auth.model';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { HcaptchaComponent } from '../../../core/security/hcaptcha.component';
import { environment } from '../../../../environments/environment';
import { AuthShellComponent } from '../../../shared/layout/auth-shell.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { TextInputComponent } from '../../../shared/ui/text-input.component';

interface RegisterFormControls {
  username: FormControl<string>;
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  ageConfirmed: FormControl<boolean>;
  termsAccepted: FormControl<boolean>;
}

@Component({
  selector: 'app-register-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthShellComponent,
    ButtonComponent,
    TextInputComponent,
    HcaptchaComponent,
  ],
  template: `
    <app-auth-shell [title]="i18n.t('register.title')" [subtitle]="i18n.t('register.subtitle')">
      <form class="grid gap-4" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (formError()) {
          <p class="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            {{ formError() }}
          </p>
        }

        <app-text-input
          formControlName="username"
          [label]="i18n.t('register.usernameLabel')"
          autocomplete="username"
          placeholder="midcarry"
          [hint]="i18n.t('register.usernameHint')"
          [error]="usernameError()"
        />
        <app-text-input
          formControlName="email"
          [label]="i18n.t('register.emailLabel')"
          type="email"
          autocomplete="email"
          [error]="emailError()"
        />
        <app-text-input
          formControlName="password"
          [label]="i18n.t('register.passwordLabel')"
          type="password"
          autocomplete="new-password"
          [error]="passwordError()"
        />
        <app-text-input
          formControlName="confirmPassword"
          [label]="i18n.t('register.confirmPasswordLabel')"
          type="password"
          autocomplete="new-password"
          [error]="confirmError()"
        />

        <label class="flex items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            formControlName="ageConfirmed"
            class="mt-1 h-4 w-4 accent-accent"
          />
          <span>
            {{ i18n.t('register.ageLabel') }}
            @if (ageError()) {
              <span class="mt-1 block text-xs text-danger">{{ ageError() }}</span>
            }
          </span>
        </label>

        <label class="flex items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            formControlName="termsAccepted"
            class="mt-1 h-4 w-4 accent-accent"
          />
          <span>
            {{ i18n.t('register.termsPrefix') }}
            <a routerLink="/terminos" class="text-accent underline">
              {{ i18n.t('register.termsLink') }}
            </a>
            {{ i18n.t('register.and') }}
            <a routerLink="/privacidad" class="text-accent underline">
              {{ i18n.t('register.privacyLink') }}
            </a>
            .
            @if (termsError()) {
              <span class="mt-1 block text-xs text-danger">{{ termsError() }}</span>
            }
          </span>
        </label>

        @if (captchaEnabled) {
          <app-hcaptcha
            #captcha
            (verified)="captchaToken.set($event)"
            (expired)="captchaToken.set(''); captchaError.set(true)"
          />
          @if (captchaError()) {
            <p class="text-xs text-danger">{{ i18n.t('register.captchaError') }}</p>
          }
        }

        <app-button type="submit" [fullWidth]="true" [loading]="submitting()">
          {{ submitting() ? i18n.t('register.submitting') : i18n.t('register.submit') }}
        </app-button>
      </form>

      <div footer class="grid gap-2">
        <p>
          {{ i18n.t('register.haveAccount') }}
          <a routerLink="/login" class="font-semibold text-accent hover:underline">
            {{ i18n.t('common.login') }}
          </a>
        </p>
      </div>
    </app-auth-shell>
  `,
})
export class RegisterPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly i18n = inject(I18nService);
  private readonly captcha = viewChild(HcaptchaComponent);

  protected readonly captchaEnabled = Boolean(environment.hcaptchaSiteKey);
  protected readonly submitting = signal(false);
  protected readonly formError = signal('');
  protected readonly captchaToken = signal('');
  protected readonly captchaError = signal(false);

  protected readonly form = new FormGroup<RegisterFormControls>({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[\p{L}\p{N}_]{3,20}$/u)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(128)],
    }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    ageConfirmed: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
    termsAccepted: new FormControl(false, {
      nonNullable: true,
      validators: [Validators.requiredTrue],
    }),
  });

  protected usernameError(): string {
    const control = this.form.controls.username;
    if (!control.touched) return '';
    if (control.hasError('required')) return this.i18n.t('register.usernameRequired');
    if (control.hasError('pattern')) return this.i18n.t('register.usernameInvalid');
    return '';
  }

  protected emailError(): string {
    const control = this.form.controls.email;
    if (!control.touched) return '';
    if (control.hasError('required')) return this.i18n.t('register.emailRequired');
    if (control.hasError('email')) return this.i18n.t('register.emailInvalid');
    return '';
  }

  protected passwordError(): string {
    const control = this.form.controls.password;
    if (!control.touched) return '';
    if (control.hasError('required')) return this.i18n.t('register.passwordMin');
    if (control.hasError('minlength')) return this.i18n.t('register.passwordMin');
    return '';
  }

  protected confirmError(): string {
    const control = this.form.controls.confirmPassword;
    if (!control.touched) return '';
    if (control.hasError('required')) return this.i18n.t('register.confirmRequired');
    if (this.passwordsMismatch()) return this.i18n.t('register.passwordMismatch');
    return '';
  }

  protected ageError(): string {
    return this.form.controls.ageConfirmed.touched &&
      this.form.controls.ageConfirmed.hasError('required')
      ? this.i18n.t('register.ageRequired')
      : '';
  }

  protected termsError(): string {
    return this.form.controls.termsAccepted.touched &&
      this.form.controls.termsAccepted.hasError('required')
      ? this.i18n.t('register.termsRequired')
      : '';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    if (this.passwordsMismatch()) {
      this.formError.set(this.i18n.t('register.passwordMismatch'));
      return;
    }

    if (this.captchaEnabled && !this.captchaToken()) {
      this.formError.set(this.i18n.t('register.captchaRequired'));
      return;
    }

    const value = this.form.getRawValue();
    const payload: RegisterRequest = {
      username: value.username.trim(),
      email: value.email.trim(),
      password: value.password,
      ageConfirmed: true,
      termsAccepted: true,
      ...(this.captchaToken() ? { captchaToken: this.captchaToken() } : {}),
    };

    this.submitting.set(true);
    this.formError.set('');

    this.auth
      .register(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          void this.router.navigate(['/onboarding'], { replaceUrl: true });
        },
        error: (error: unknown) => {
          this.submitting.set(false);
          this.formError.set(toUserMessage(error));
          this.captchaToken.set('');
          this.captcha()?.reset();
        },
      });
  }

  private passwordsMismatch(): boolean {
    return this.form.controls.password.value !== this.form.controls.confirmPassword.value;
  }
}
