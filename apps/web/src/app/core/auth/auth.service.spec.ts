import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiService } from '../api/api.service';
import type { AuthProfileResponse, AuthResponse, AuthUser } from '../api/models/auth.model';
import { AuthService } from './auth.service';

const player: AuthUser = {
  id: 'user-1',
  username: 'mid_lan',
  email: 'mid@duolan.online',
  role: 'player',
  emailVerified: true,
  status: 'active',
  ageConfirmedAt: '2026-10-25T00:00:00.000Z',
  termsAcceptedAt: '2026-10-25T00:00:00.000Z',
  warningCount: 0,
  profileCompleted: true,
};

const authResponse: AuthResponse = {
  status: 'success',
  token: 'jwt-token',
  user: player,
};

const profileResponse: AuthProfileResponse = {
  status: 'success',
  user: player,
};

describe('AuthService', () => {
  let service: AuthService;
  let api: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    localStorage.clear();

    api = {
      get: vi.fn(),
      post: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [AuthService, { provide: ApiService, useValue: api }],
    });

    service = TestBed.inject(AuthService);
  });

  it('inicia sesión y persiste token y usuario', async () => {
    api.post.mockReturnValue(of(authResponse));

    const user = await firstValueFrom(
      service.login({ identifier: 'mid@duolan.online', password: 'password123' }),
    );

    expect(user.username).toBe('mid_lan');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.profileCompleted()).toBe(true);
    expect(localStorage.getItem('duolan_token')).toBe('jwt-token');
    expect(JSON.parse(localStorage.getItem('duolan_user') ?? '{}')).toMatchObject({
      username: 'mid_lan',
    });
  });

  it('expone rol admin y perfil incompleto', async () => {
    api.post.mockReturnValue(
      of({
        ...authResponse,
        user: { ...player, role: 'admin' as const, profileCompleted: false },
      }),
    );

    await firstValueFrom(service.login({ identifier: 'admin', password: 'password123' }));

    expect(service.isAdmin()).toBe(true);
    expect(service.profileCompleted()).toBe(false);
  });

  it('cierra sesión y limpia el storage', async () => {
    api.post.mockReturnValue(of(authResponse));
    await firstValueFrom(service.login({ identifier: 'mid', password: 'password123' }));

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.user()).toBeNull();
    expect(localStorage.getItem('duolan_token')).toBeNull();
    expect(localStorage.getItem('duolan_user')).toBeNull();
  });

  it('restaura la sesión desde /auth/profile si hay token', async () => {
    service.setSession('stored-token', player);
    api.get.mockReturnValue(of(profileResponse));

    await service.restoreSession();

    expect(api.get).toHaveBeenCalledWith('/auth/profile');
    expect(service.user()?.username).toBe('mid_lan');
    expect(service.loading()).toBe(false);
  });

  it('no llama a la API al restaurar sin token', async () => {
    await service.restoreSession();

    expect(api.get).not.toHaveBeenCalled();
    expect(service.isAuthenticated()).toBe(false);
  });

  it('limpia la sesión si el perfil restaurado falla', async () => {
    service.setSession('stored-token', player);
    api.get.mockReturnValue(throwError(() => new Error('401')));

    await service.restoreSession();

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('duolan_token')).toBeNull();
  });
});
