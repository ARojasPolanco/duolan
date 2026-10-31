import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import type { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import type {
  AuthProfileResponse,
  AuthResponse,
  AuthUser,
  ForgotPasswordResponse,
  DeleteAccountResponse,
  LoginRequest,
  RegisterRequest,
  ResendVerificationResponse,
  ResetPasswordResponse,
  VerifyEmailResponse,
} from '../api/models/auth.model';

const TOKEN_KEY = 'duolan_token';
const USER_KEY = 'duolan_user';

const readStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const user = parsed as Partial<AuthUser>;
    return typeof user.id === 'string' && typeof user.username === 'string'
      ? (user as AuthUser)
      : null;
  } catch {
    return null;
  }
};

const readStoredToken = (): string | null => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);

  private readonly _token = signal<string | null>(readStoredToken());
  private readonly _user = signal<AuthUser | null>(readStoredUser());
  private readonly _loading = signal<boolean>(Boolean(readStoredToken()));

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => Boolean(this._token()));
  readonly isAdmin = computed(() => this._user()?.role === 'admin');
  readonly profileCompleted = computed(() => this._user()?.profileCompleted === true);

  getToken(): string | null {
    return this._token();
  }

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.api
      .post<AuthResponse>('/auth/login', payload)
      .pipe(tap((response) => this.setSession(response.token, response.user)));
  }

  register(payload: RegisterRequest): Observable<AuthUser> {
    return this.api.post<AuthResponse>('/auth/register', payload).pipe(
      tap((response) => this.setSession(response.token, response.user)),
      map((response) => response.user),
    );
  }

  verifyEmail(token: string): Observable<VerifyEmailResponse> {
    return this.api.get<VerifyEmailResponse>('/auth/verify-email', { token });
  }

  resendVerification(): Observable<ResendVerificationResponse> {
    return this.api.post<ResendVerificationResponse>('/auth/resend-verification');
  }

  forgotPassword(email: string): Observable<ForgotPasswordResponse> {
    return this.api.post<ForgotPasswordResponse>('/auth/forgot-password', { email });
  }

  resetPassword(token: string, password: string): Observable<ResetPasswordResponse> {
    return this.api.post<ResetPasswordResponse>('/auth/reset-password', { token, password });
  }

  deleteAccount(password: string): Observable<DeleteAccountResponse> {
    return this.api.delete<DeleteAccountResponse>('/auth/account', { password });
  }

  refreshProfile(): Observable<AuthUser> {
    return this.api.get<AuthProfileResponse>('/auth/profile').pipe(
      tap((response) => this.updateUser(response.user)),
      map((response) => response.user),
    );
  }

  async restoreSession(): Promise<void> {
    if (!this.getToken()) {
      this._loading.set(false);
      return;
    }

    this._loading.set(true);

    try {
      const response = await firstValueFrom(this.api.get<AuthProfileResponse>('/auth/profile'));
      this.updateUser(response.user);
    } catch {
      this.logout();
    } finally {
      this._loading.set(false);
    }
  }

  setSession(token: string, user: AuthUser): void {
    this._token.set(token);
    localStorage.setItem(TOKEN_KEY, token);
    this.updateUser(user);
    this._loading.set(false);
  }

  updateUser(user: AuthUser): void {
    this._user.set(user);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  logout(): void {
    this._token.set(null);
    this._user.set(null);
    this._loading.set(false);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
