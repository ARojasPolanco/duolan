import { TestBed } from '@angular/core/testing';
import { Router, type ActivatedRouteSnapshot, type RouterStateSnapshot } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { adminGuard, authGuard, playerGuard, profileCompletedGuard } from './guards';

interface AuthState {
  authenticated: boolean;
  admin: boolean;
  profileCompleted: boolean;
}

const route = {} as ActivatedRouteSnapshot;
const state = (url: string) => ({ url }) as RouterStateSnapshot;

describe('auth guards', () => {
  let authState: AuthState;
  let router: {
    url: string;
    createUrlTree: ReturnType<typeof vi.fn>;
    parseUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authState = { authenticated: false, admin: false, profileCompleted: false };
    router = {
      url: '/match',
      createUrlTree: vi.fn((commands: unknown[], extras?: unknown) => ({ commands, extras })),
      parseUrl: vi.fn((url: string) => ({ url })),
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthService,
          useValue: {
            isAuthenticated: () => authState.authenticated,
            isAdmin: () => authState.admin,
            profileCompleted: () => authState.profileCompleted,
          },
        },
        { provide: Router, useValue: router },
      ],
    });
  });

  it('authGuard redirige a login con redirect', () => {
    const result = TestBed.runInInjectionContext(() => authGuard(route, state('/match')));

    expect(router.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { redirect: '/match' },
    });
    expect(result).toEqual({
      commands: ['/login'],
      extras: { queryParams: { redirect: '/match' } },
    });
  });

  it('authGuard permite sesión autenticada', () => {
    authState.authenticated = true;

    expect(TestBed.runInInjectionContext(() => authGuard(route, state('/match')))).toBe(true);
  });

  it('playerGuard manda al admin a /admin', () => {
    authState.authenticated = true;
    authState.admin = true;

    expect(TestBed.runInInjectionContext(() => playerGuard(route, state('/inicio')))).toEqual({
      url: '/admin',
    });
  });

  it('adminGuard manda al jugador a /inicio', () => {
    authState.authenticated = true;

    expect(TestBed.runInInjectionContext(() => adminGuard(route, state('/admin')))).toEqual({
      url: '/inicio',
    });
  });

  it('adminGuard permite admin', () => {
    authState.authenticated = true;
    authState.admin = true;

    expect(TestBed.runInInjectionContext(() => adminGuard(route, state('/admin')))).toBe(true);
  });

  it('profileCompletedGuard manda a onboarding si falta el perfil', () => {
    authState.authenticated = true;

    expect(
      TestBed.runInInjectionContext(() => profileCompletedGuard(route, state('/match'))),
    ).toEqual({ url: '/onboarding' });
  });

  it('profileCompletedGuard permite perfil completo', () => {
    authState.authenticated = true;
    authState.profileCompleted = true;

    expect(TestBed.runInInjectionContext(() => profileCompletedGuard(route, state('/match')))).toBe(
      true,
    );
  });
});
