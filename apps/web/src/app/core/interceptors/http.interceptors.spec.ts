import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api/api-error';
import { ApiService } from '../api/api.service';
import type { AuthUser } from '../api/models/auth.model';
import { AuthService } from '../auth/auth.service';
import { ToastService } from '../toast/toast.service';
import { authInterceptor } from './auth.interceptor';
import { errorInterceptor } from './error.interceptor';

const player: AuthUser = {
  id: 'user-1',
  username: 'mid_lan',
  email: 'mid@duolan.online',
  role: 'player',
  emailVerified: true,
  status: 'active',
  ageConfirmedAt: null,
  termsAcceptedAt: null,
  warningCount: 0,
  profileCompleted: true,
};

describe('HTTP interceptors', () => {
  let httpMock: HttpTestingController;
  let auth: AuthService;
  let router: {
    url: string;
    navigate: ReturnType<typeof vi.fn>;
    createUrlTree: ReturnType<typeof vi.fn>;
    parseUrl: ReturnType<typeof vi.fn>;
  };
  let toast: { error: ReturnType<typeof vi.fn>; success: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    localStorage.clear();

    router = {
      url: '/inicio',
      navigate: vi.fn().mockResolvedValue(true),
      createUrlTree: vi.fn(),
      parseUrl: vi.fn(),
    };
    toast = { error: vi.fn(), success: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: {} },
        { provide: Router, useValue: router },
        { provide: ToastService, useValue: toast },
        provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    auth = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    auth.setSession('jwt-token', player);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('agrega Authorization a requests protegidas', () => {
    const http = TestBed.inject(HttpClient);

    http.get('/api/v1/profiles/me').subscribe();
    const request = httpMock.expectOne('/api/v1/profiles/me');

    expect(request.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    request.flush({ status: 'success' });
  });

  it('no agrega Authorization a endpoints de auth', () => {
    const http = TestBed.inject(HttpClient);

    http.post('/api/v1/auth/login', { identifier: 'x', password: 'y' }).subscribe();
    const request = httpMock.expectOne('/api/v1/auth/login');

    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ status: 'success' });
  });

  it('en 401 limpia la sesión y redirige a login', () => {
    const http = TestBed.inject(HttpClient);

    http.get('/api/v1/profiles/me').subscribe({ error: () => undefined });
    httpMock
      .expectOne('/api/v1/profiles/me')
      .flush(
        { status: 'fail', message: 'Token inválido' },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(auth.getToken()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { redirect: '/inicio' },
    });
  });

  it('en 401 sobre una ruta pública de auth no redirige en loop', () => {
    router.url = '/login';
    const http = TestBed.inject(HttpClient);

    http.get('/api/v1/profiles/me').subscribe({ error: () => undefined });
    httpMock
      .expectOne('/api/v1/profiles/me')
      .flush(
        { status: 'fail', message: 'Token inválido' },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(auth.getToken()).toBeNull();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('en 401 de un endpoint de auth no limpia la sesión ni redirige', () => {
    const http = TestBed.inject(HttpClient);

    http.post('/api/v1/auth/login', { identifier: 'x', password: 'y' }).subscribe({
      error: () => undefined,
    });
    httpMock
      .expectOne('/api/v1/auth/login')
      .flush(
        { status: 'fail', message: 'Credenciales incorrectas' },
        { status: 401, statusText: 'Unauthorized' },
      );

    expect(auth.getToken()).toBe('jwt-token');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('normaliza errores 5xx a ApiError y avisa por toast', () => {
    const http = TestBed.inject(HttpClient);
    let received: unknown;

    http.get('/api/v1/profiles/me').subscribe({
      error: (error: unknown) => {
        received = error;
      },
    });
    httpMock
      .expectOne('/api/v1/profiles/me')
      .flush({ status: 'error', message: 'Explotó' }, { status: 500, statusText: 'Server Error' });

    expect(received).toBeInstanceOf(ApiError);
    expect((received as ApiError).status).toBe(500);
    expect((received as ApiError).message).toBe('Explotó');
    expect(toast.error).toHaveBeenCalledWith('Explotó');
  });
});
