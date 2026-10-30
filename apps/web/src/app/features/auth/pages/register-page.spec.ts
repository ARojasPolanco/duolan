import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AuthUser } from '../../../core/api/models/auth.model';
import { AuthService } from '../../../core/auth/auth.service';
import { RegisterPage } from './register-page';

const user: AuthUser = {
  id: 'user-1',
  username: 'new_player',
  email: 'new@duolan.online',
  role: 'player',
  emailVerified: false,
  status: 'active',
  ageConfirmedAt: '2026-10-30T00:00:00.000Z',
  termsAcceptedAt: '2026-10-30T00:00:00.000Z',
  warningCount: 0,
  profileCompleted: false,
};

describe('RegisterPage', () => {
  let register: ReturnType<typeof vi.fn>;
  let router: Router;

  beforeEach(() => {
    register = vi.fn();
    TestBed.configureTestingModule({
      imports: [RegisterPage],
      providers: [provideRouter([]), { provide: AuthService, useValue: { register } }],
    });
    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  const setInput = (input: HTMLInputElement, value: string): void => {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('blur', { bubbles: true }));
  };

  const fillValid = (fixture: { nativeElement: HTMLElement }): void => {
    const inputs = fixture.nativeElement.querySelectorAll('app-text-input input');
    setInput(inputs[0] as HTMLInputElement, 'new_player');
    setInput(inputs[1] as HTMLInputElement, 'new@duolan.online');
    setInput(inputs[2] as HTMLInputElement, 'password123');
    setInput(inputs[3] as HTMLInputElement, 'password123');

    const checkboxes = fixture.nativeElement.querySelectorAll('input[type="checkbox"]');
    (checkboxes[0] as HTMLInputElement).click();
    (checkboxes[1] as HTMLInputElement).click();
  };

  const submit = async (fixture: {
    nativeElement: HTMLElement;
    detectChanges: () => void;
    whenStable: () => Promise<unknown>;
  }): Promise<void> => {
    const button = fixture.nativeElement.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    await fixture.whenStable();
  };

  it('no envía el formulario vacío', async () => {
    const fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();

    await submit(fixture);

    expect(register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Ingresá un nombre de usuario');
  });

  it('rechaza contraseñas distintas', async () => {
    const fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();
    fillValid(fixture);
    const inputs = fixture.nativeElement.querySelectorAll('app-text-input input');
    setInput(inputs[3] as HTMLInputElement, 'otraPassword123');
    fixture.detectChanges();

    await submit(fixture);

    expect(register).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Las contraseñas no coinciden');
  });

  it('registra con +18 y términos aceptados y navega al onboarding', async () => {
    register.mockReturnValue(of(user));
    const fixture = TestBed.createComponent(RegisterPage);
    fixture.detectChanges();
    fillValid(fixture);
    fixture.detectChanges();

    await submit(fixture);

    expect(register).toHaveBeenCalledWith({
      username: 'new_player',
      email: 'new@duolan.online',
      password: 'password123',
      ageConfirmed: true,
      termsAccepted: true,
    });
    expect(router.navigate).toHaveBeenCalledWith(['/onboarding'], { replaceUrl: true });
  });
});
