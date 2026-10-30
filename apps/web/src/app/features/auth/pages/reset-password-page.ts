import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { AuthShellComponent } from '../../../shared/layout/auth-shell.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { TextInputComponent } from '../../../shared/ui/text-input.component';

interface ResetFormControls {
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'app-reset-password-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthShellComponent,
    ButtonComponent,
    TextInputComponent,
  ],
  template: `
    <app-auth-shell [title]="i18n.t('reset.title')" [subtitle]="i18n.t('reset.subtitle')">
      <form class="grid gap-4" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        @if (success()) {
          <p
            class="rounded-xl border border-success/40 bg-success/10 px-3 py-2 text-xs text-success"
          >
            {{ i18n.t('reset.success') }}
          </p>
        }
        @if (errorMessage()) {
          <p class="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            {{ errorMessage() }}
          </p>
        }

        <app-text-input
          formControlName="password"
          [label]="i18n.t('reset.passwordLabel')"
          type="password"
          autocomplete="new-password"
          [error]="passwordError()"
        />
        <app-text-input
          formControlName="confirmPassword"
          [label]="i18n.t('reset.confirmLabel')"
          type="password"
          autocomplete="new-password"
          [error]="confirmError()"
        />

        <app-button type="submit" [fullWidth]="true" [loading]="submitting()">
          {{ submitting() ? i18n.t('reset.saving') : i18n.t('reset.submit') }}
        </app-button>
      </form>

      <div footer>
        <a routerLink="/login" class="font-semibold text-accent hover:underline">
          {{ i18n.t('reset.backLogin') }}
        </a>
      </div>
    </app-auth-shell>
  `,
})
export class ResetPasswordPage {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly i18n = inject(I18nService);

  protected readonly submitting = signal(false);
  protected readonly success = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly form = new FormGroup<ResetFormControls>({
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(10), Validators.maxLength(128)],
    }),
    confirmPassword: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  protected passwordError(): string {
    const control = this.form.controls.password;
    if (!control.touched) return '';
    return control.hasError('required') || control.hasError('minlength')
      ? this.i18n.t('reset.passwordMin')
      : '';
  }

  protected confirmError(): string {
    const control = this.form.controls.confirmPassword;
    if (!control.touched) return '';
    if (control.hasError('required')) return this.i18n.t('register.confirmRequired');
    if (control.value !== this.form.controls.password.value) {
      return this.i18n.t('reset.mismatch');
    }
    return '';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.errorMessage.set(this.i18n.t('reset.missingToken'));
      return;
    }

    if (this.form.controls.password.value !== this.form.controls.confirmPassword.value) {
      this.errorMessage.set(this.i18n.t('reset.mismatch'));
      return;
    }

    this.submitting.set(true);
    this.success.set(false);
    this.errorMessage.set('');

    this.auth
      .resetPassword(token, this.form.controls.password.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.success.set(true);
          this.form.reset({ password: '', confirmPassword: '' });
        },
        error: () => {
          this.submitting.set(false);
          this.errorMessage.set(this.i18n.t('reset.error'));
        },
      });
  }
}
