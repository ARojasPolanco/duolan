import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../../../core/api/api-error';
import { AuthService } from '../../../core/auth/auth.service';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let login: ReturnType<typeof vi.fn>;
  let router: Router;

  beforeEach(() => {
    login = vi.fn();

    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), { provide: AuthService, useValue: { login } }],
    });

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
  });

  const fillInputs = (fixture: { nativeElement: HTMLElement }): void => {
    const inputs = fixture.nativeElement.querySelectorAll('input');
    const identifier = inputs[0] as HTMLInputElement;
    const password = inputs[1] as HTMLInputElement;

    identifier.value = 'demo_mid@duolan.online';
    identifier.dispatchEvent(new Event('input', { bubbles: true }));
    identifier.dispatchEvent(new Event('blur', { bubbles: true }));
    password.value = 'Demo12345!';
    password.dispatchEvent(new Event('input', { bubbles: true }));
    password.dispatchEvent(new Event('blur', { bubbles: true }));
  };

  it('no envía el formulario vacío y muestra errores', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Ingresá tu email o username');
    expect(fixture.nativeElement.textContent).toContain('Ingresá tu contraseña');
  });

  it('inicia sesión y navega a inicio cuando no hay redirect', async () => {
    login.mockReturnValue(
      of({
        id: 'user-1',
        username: 'demo_mid',
        email: 'demo_mid@duolan.online',
        role: 'player',
        emailVerified: true,
        status: 'active',
        ageConfirmedAt: null,
        termsAcceptedAt: null,
        warningCount: 0,
        profileCompleted: true,
      }),
    );

    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    fillInputs(fixture);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(login).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/inicio'], { replaceUrl: true });
  });

  it('muestra el error del backend sin redirigir', async () => {
    login.mockReturnValue(throwError(() => new ApiError('Credenciales incorrectas', 401)));

    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    fillInputs(fixture);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(login).toHaveBeenCalledWith({
      identifier: 'demo_mid@duolan.online',
      password: 'Demo12345!',
    });
    expect(fixture.nativeElement.textContent).toContain('Credenciales incorrectas');
    expect(router.navigate).not.toHaveBeenCalled();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
