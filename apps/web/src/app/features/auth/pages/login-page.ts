import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toUserMessage } from '../../../core/api/api-error';
import { AuthService } from '../../../core/auth/auth.service';
import { AuthShellComponent } from '../../../shared/layout/auth-shell.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { TextInputComponent } from '../../../shared/ui/text-input.component';

@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AuthShellComponent,
    ButtonComponent,
    TextInputComponent,
  ],
  template: `
    <app-auth-shell
      title="Iniciar sesión"
      subtitle="Entrá con tu email o nombre de usuario para buscar duo en LAN."
    >
      <form class="grid gap-4" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <app-text-input
          formControlName="identifier"
          label="Email o nombre de usuario"
          autocomplete="username"
          placeholder="tu@email.com"
          [error]="identifierError()"
        />
        <app-text-input
          formControlName="password"
          label="Contraseña"
          type="password"
          autocomplete="current-password"
          [error]="passwordError()"
        />

        @if (errorMessage()) {
          <p class="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger">
            {{ errorMessage() }}
          </p>
        }

        <app-button type="submit" [fullWidth]="true" [loading]="submitting()"> Entrar </app-button>
      </form>

      <div footer class="grid gap-2">
        <a routerLink="/forgot-password" class="font-semibold text-accent hover:underline">
          ¿Olvidaste tu contraseña?
        </a>
        <p>
          ¿No tenés cuenta?
          <a routerLink="/register" class="font-semibold text-accent hover:underline">
            Crear cuenta
          </a>
        </p>
      </div>
    </app-auth-shell>
  `,
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly redirect = input('');

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  protected identifierError(): string {
    const control = this.form.controls.identifier;
    return control.touched && control.hasError('required') ? 'Ingresá tu email o username.' : '';
  }

  protected passwordError(): string {
    const control = this.form.controls.password;
    return control.touched && control.hasError('required') ? 'Ingresá tu contraseña.' : '';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    this.auth
      .login(this.form.getRawValue())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.submitting.set(false);
          const redirect = this.redirect();
          const safeRedirect =
            redirect.startsWith('/') && !redirect.startsWith('//') ? redirect : '';

          if (user.role === 'admin') {
            void this.router.navigate(['/admin'], { replaceUrl: true });
          } else if (safeRedirect) {
            void this.router.navigateByUrl(safeRedirect, { replaceUrl: true });
          } else if (user.profileCompleted) {
            void this.router.navigate(['/inicio'], { replaceUrl: true });
          } else {
            void this.router.navigate(['/onboarding'], { replaceUrl: true });
          }
        },
        error: (error: unknown) => {
          this.submitting.set(false);
          this.errorMessage.set(toUserMessage(error));
        },
      });
  }
}
