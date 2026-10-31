import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { AdminUserDetail } from '../../../core/api/models/admin.model';
import { AdminService } from '../../../core/api/admin.service';
import {
  COUNTRY_LABEL_KEYS,
  DIVISION_LABEL_KEYS,
  RANK_LABEL_KEYS,
  REPORT_REASON_LABEL_KEYS,
  ROLE_LABEL_KEYS,
  STYLE_LABEL_KEYS,
} from '../../../core/i18n/labels';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/toast/toast.service';
import { initialsOf } from '../../../core/utils/labels';
import { formatDateTime } from '../../../core/utils/time';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton.component';

const USERNAME_STATUS: Record<string, string> = {
  pending_user: 'Esperando al usuario',
  pending_admin: 'Propuesta para revisar',
  approved: 'Aprobada',
  rejected: 'Rechazada',
};

const USERNAME_CLASS: Record<string, string> = {
  pending_user: 'border-gold/40 bg-gold/10 text-gold',
  pending_admin: 'border-accent/40 bg-accent/10 text-accent',
  approved: 'border-success/40 bg-success/10 text-success',
  rejected: 'border-danger/40 bg-danger/10 text-danger',
};

@Component({
  selector: 'app-admin-user-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, CardComponent, SkeletonComponent],
  template: `
    <div class="grid gap-5">
      <a
        routerLink="/admin/usuarios"
        class="inline-flex min-h-11 items-center text-xs font-semibold text-muted hover:text-text"
      >
        ← Volver a usuarios
      </a>

      @if (error()) {
        <p class="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          {{ error() }}
        </p>
      }

      @if (loading()) {
        <app-skeleton variant="card" />
        <div class="grid gap-4 lg:grid-cols-2">
          <app-skeleton variant="card" />
          <app-skeleton variant="card" />
        </div>
      } @else if (user(); as user) {
        <section class="rounded-2xl border border-border bg-surface p-5 sm:p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div class="flex min-w-0 items-center gap-4">
              <span
                class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-2 text-lg font-extrabold text-accent"
              >
                {{ initials(user.username) }}
              </span>
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2">
                  <h1 class="truncate text-2xl font-extrabold">{{ user.username }}</h1>
                  <span
                    class="rounded-full border border-border bg-surface-2 px-2 py-1 text-[10px] font-semibold text-muted"
                  >
                    {{ user.role === 'admin' ? 'Admin' : 'Jugador' }}
                  </span>
                  <span
                    class="rounded-full border px-2 py-1 text-[10px] font-semibold"
                    [class]="stateClass(user)"
                  >
                    {{ stateLabel(user) }}
                  </span>
                </div>
                <p class="mt-1 truncate text-sm text-muted">{{ user.email }}</p>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
              <div class="rounded-xl border border-border bg-bg px-4 py-3">
                <p class="text-lg font-extrabold">{{ user.stats.openReports }}</p>
                <p class="text-[10px] text-muted">Reportes</p>
              </div>
              <div class="rounded-xl border border-border bg-bg px-4 py-3">
                <p class="text-lg font-extrabold">{{ user.stats.sanctions }}</p>
                <p class="text-[10px] text-muted">Sanciones</p>
              </div>
              <div class="rounded-xl border border-border bg-bg px-4 py-3">
                <p class="text-lg font-extrabold">{{ user.stats.activeConnections }}</p>
                <p class="text-[10px] text-muted">Matches</p>
              </div>
              <div class="rounded-xl border border-border bg-bg px-4 py-3">
                <p class="text-lg font-extrabold">{{ user.warningCount }}</p>
                <p class="text-[10px] text-muted">Advertencias</p>
              </div>
            </div>
          </div>
        </section>

        <div class="grid gap-4 lg:grid-cols-2">
          <app-card padding="lg">
            <h2 class="text-lg font-bold">Cuenta</h2>
            <dl class="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt class="text-[11px] uppercase tracking-wide text-muted">Email</dt>
                <dd class="mt-1 text-sm font-semibold">
                  {{ user.emailVerified ? 'Verificado' : 'Pendiente' }}
                </dd>
              </div>
              <div>
                <dt class="text-[11px] uppercase tracking-wide text-muted">Alta</dt>
                <dd class="mt-1 text-sm font-semibold">{{ format(user.createdAt) }}</dd>
              </div>
              <div>
                <dt class="text-[11px] uppercase tracking-wide text-muted">Último login</dt>
                <dd class="mt-1 text-sm font-semibold">{{ format(user.lastLoginAt) }}</dd>
              </div>
              <div>
                <dt class="text-[11px] uppercase tracking-wide text-muted">Última actividad</dt>
                <dd class="mt-1 text-sm font-semibold">{{ format(user.lastActiveAt) }}</dd>
              </div>
              <div>
                <dt class="text-[11px] uppercase tracking-wide text-muted">Suspensión</dt>
                <dd class="mt-1 text-sm font-semibold">
                  {{ user.suspendedUntil ? format(user.suspendedUntil) : 'Sin suspensión' }}
                </dd>
              </div>
              <div>
                <dt class="text-[11px] uppercase tracking-wide text-muted">Baja</dt>
                <dd class="mt-1 text-sm font-semibold">
                  {{ user.deletionScheduledFor ? format(user.deletionScheduledFor) : 'Sin baja' }}
                </dd>
              </div>
            </dl>
          </app-card>

          <app-card padding="lg">
            <h2 class="text-lg font-bold">Perfil</h2>
            @if (user.profile; as profile) {
              <dl class="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt class="text-[11px] uppercase tracking-wide text-muted">Riot ID</dt>
                  <dd class="mt-1 text-sm font-semibold">{{ profile.riotId || '-' }}</dd>
                </div>
                <div>
                  <dt class="text-[11px] uppercase tracking-wide text-muted">País</dt>
                  <dd class="mt-1 text-sm font-semibold">
                    {{ profile.country ? i18n.t(COUNTRY_LABEL_KEYS[profile.country]) : '-' }}
                  </dd>
                </div>
                <div>
                  <dt class="text-[11px] uppercase tracking-wide text-muted">Rango</dt>
                  <dd class="mt-1 text-sm font-semibold">{{ rankLabel(profile) }}</dd>
                </div>
                <div>
                  <dt class="text-[11px] uppercase tracking-wide text-muted">Roles</dt>
                  <dd class="mt-1 text-sm font-semibold">
                    {{ i18n.t(ROLE_LABEL_KEYS[profile.primaryRole]) }} /
                    {{ i18n.t(ROLE_LABEL_KEYS[profile.secondaryRole]) }}
                  </dd>
                </div>
                <div>
                  <dt class="text-[11px] uppercase tracking-wide text-muted">Estilo</dt>
                  <dd class="mt-1 text-sm font-semibold">
                    {{ i18n.t(STYLE_LABEL_KEYS[profile.playStyle]) }}
                  </dd>
                </div>
                <div>
                  <dt class="text-[11px] uppercase tracking-wide text-muted">Reputación</dt>
                  <dd class="mt-1 text-sm font-semibold">{{ profile.reputation.score }}</dd>
                </div>
              </dl>
            } @else {
              <p class="mt-3 text-sm text-muted">Perfil incompleto.</p>
            }
          </app-card>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <app-card padding="lg">
            <h2 class="text-lg font-bold">Moderación</h2>
            <div class="mt-4 grid gap-4">
              <div>
                <p class="text-xs font-semibold text-muted">Motivo de advertencia</p>
                <input
                  [value]="warnReason()"
                  (input)="warnReason.set($any($event.target).value)"
                  class="mt-2 min-h-11 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm"
                  placeholder="Motivo"
                />
                <app-button
                  class="mt-4"
                  variant="danger"
                  size="sm"
                  [loading]="busy() === 'warn'"
                  (click)="warn(user)"
                >
                  Enviar advertencia
                </app-button>
              </div>

              <div class="border-t border-border pt-4">
                <p class="text-xs font-semibold text-muted">Suspensión</p>
                <select
                  [value]="suspendDays()"
                  (change)="setSuspendDays($event)"
                  class="mt-2 min-h-11 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm"
                >
                  <option value="7">7 días</option>
                  <option value="30">30 días</option>
                  <option value="permanent">Permanente</option>
                </select>
                <input
                  [value]="suspendReason()"
                  (input)="suspendReason.set($any($event.target).value)"
                  class="mt-2 min-h-11 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm"
                  placeholder="Motivo"
                />
                <app-button
                  class="mt-4"
                  variant="danger"
                  size="sm"
                  [loading]="busy() === 'suspend'"
                  (click)="suspend(user)"
                >
                  Suspender
                </app-button>
              </div>
            </div>
          </app-card>

          <app-card padding="lg">
            <h2 class="text-lg font-bold">Solicitud de username</h2>
            @if (user.usernameChangeRequest; as request) {
              <div class="mt-3 rounded-xl border border-border bg-bg p-4">
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <p class="text-sm font-semibold">
                    @if (request.suggestedUsername) {
                      Propuesta: &#64;{{ request.suggestedUsername }}
                    } @else {
                      Esperando propuesta del usuario
                    }
                  </p>
                  <span
                    class="rounded-full border px-2 py-1 text-[10px] font-semibold"
                    [class]="usernameClass(request.status)"
                  >
                    {{ usernameStatus(request.status) }}
                  </span>
                </div>
                <input
                  [value]="usernameNote()"
                  (input)="usernameNote.set($any($event.target).value)"
                  class="mt-3 min-h-11 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm"
                  placeholder="Nota (opcional)"
                />
                @if (request.status === 'pending_admin') {
                  <div class="mt-4 flex flex-wrap gap-3">
                    <app-button
                      size="sm"
                      [loading]="busy() === 'username'"
                      (click)="approveUsername(user)"
                    >
                      Aprobar
                    </app-button>
                    <app-button
                      variant="danger"
                      size="sm"
                      [disabled]="busy() === 'username'"
                      (click)="rejectUsername(user)"
                    >
                      Rechazar
                    </app-button>
                  </div>
                }
              </div>
            } @else {
              <p class="mt-3 text-sm text-muted">No hay solicitud activa.</p>
              <input
                [value]="usernameNote()"
                (input)="usernameNote.set($any($event.target).value)"
                class="mt-3 min-h-11 w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm"
                placeholder="Motivo (opcional)"
              />
              <app-button
                class="mt-4"
                variant="secondary"
                size="sm"
                [loading]="busy() === 'username'"
                (click)="requestUsername(user)"
              >
                Solicitar cambio
              </app-button>
            }
          </app-card>
        </div>

        <app-card padding="lg">
          <h2 class="text-lg font-bold">Reportes</h2>
          @if (user.reports.length) {
            <div class="mt-3 grid gap-2">
              @for (report of user.reports; track report.id) {
                <div class="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm">
                  <p class="font-semibold">
                    {{ i18n.t(REASON_KEYS[report.reason]) }} · {{ report.status }}
                  </p>
                  @if (report.details) {
                    <p class="mt-1 text-xs text-muted">{{ report.details }}</p>
                  }
                </div>
              }
            </div>
          } @else {
            <p class="mt-3 text-sm text-muted">Sin reportes.</p>
          }
        </app-card>

        <app-card padding="lg">
          <h2 class="text-lg font-bold">Sanciones</h2>
          @if (user.sanctions.length) {
            <div class="mt-3 grid gap-2">
              @for (sanction of user.sanctions; track sanction.id) {
                <div class="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm">
                  <p class="font-semibold">{{ sanction.action }}</p>
                  <p class="mt-1 text-xs text-muted">
                    {{ sanction.reason }} · {{ format(sanction.createdAt) }}
                  </p>
                </div>
              }
            </div>
          } @else {
            <p class="mt-3 text-sm text-muted">Sin sanciones.</p>
          }
        </app-card>
      }
    </div>
  `,
})
export class AdminUserDetailPage implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);
  protected readonly i18n = inject(I18nService);

  readonly id = input.required<string>();

  protected readonly user = signal<AdminUserDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly warnReason = signal('');
  protected readonly suspendDays = signal<'7' | '30' | 'permanent'>('7');
  protected readonly suspendReason = signal('');
  protected readonly usernameNote = signal('');
  protected readonly busy = signal<'warn' | 'suspend' | 'username' | null>(null);

  protected readonly REASON_KEYS = REPORT_REASON_LABEL_KEYS;
  protected readonly COUNTRY_LABEL_KEYS = COUNTRY_LABEL_KEYS;
  protected readonly ROLE_LABEL_KEYS = ROLE_LABEL_KEYS;
  protected readonly STYLE_LABEL_KEYS = STYLE_LABEL_KEYS;

  ngOnInit(): void {
    this.load();
  }

  protected initials(username: string): string {
    return initialsOf(username);
  }

  protected format(value: string | null): string {
    return value ? formatDateTime(value, this.i18n.locale()) : '-';
  }

  protected stateLabel(user: AdminUserDetail): string {
    if (user.isDeleted) return user.deletionScheduledFor ? 'Baja pendiente' : 'Eliminado';
    return user.status === 'suspended' ? 'Suspendido' : 'Activo';
  }

  protected stateClass(user: AdminUserDetail): string {
    return user.isDeleted || user.status === 'suspended'
      ? 'border-danger/40 bg-danger/10 text-danger'
      : 'border-success/40 bg-success/10 text-success';
  }

  protected rankLabel(profile: AdminUserDetail['profile']): string {
    if (!profile) return '-';
    const tier = this.i18n.t(RANK_LABEL_KEYS[profile.rankTier]);
    const division = profile.rankDivision
      ? this.i18n.t(DIVISION_LABEL_KEYS[profile.rankDivision])
      : '';
    return division ? `${tier} ${division}` : tier;
  }

  protected usernameStatus(status: string): string {
    return USERNAME_STATUS[status] ?? status;
  }

  protected usernameClass(status: string): string {
    return USERNAME_CLASS[status] ?? USERNAME_CLASS['pending_admin'];
  }

  protected setSuspendDays(event: Event): void {
    this.suspendDays.set((event.target as HTMLSelectElement).value as '7' | '30' | 'permanent');
  }

  protected warn(user: AdminUserDetail): void {
    if (!this.warnReason().trim()) {
      this.toast.error('Ingresá un motivo.');
      return;
    }

    this.busy.set('warn');
    this.admin.warnUser(user.id, { reason: this.warnReason().trim() }).subscribe({
      next: () => {
        this.busy.set(null);
        this.warnReason.set('');
        this.toast.success('Advertencia enviada.');
        this.load();
      },
      error: () => {
        this.busy.set(null);
        this.toast.error('No pudimos enviar la advertencia.');
      },
    });
  }

  protected suspend(user: AdminUserDetail): void {
    if (!this.suspendReason().trim()) {
      this.toast.error('Ingresá un motivo.');
      return;
    }

    const days = this.suspendDays() === 'permanent' ? null : (Number(this.suspendDays()) as 7 | 30);
    this.busy.set('suspend');
    this.admin.suspendUser(user.id, { days, reason: this.suspendReason().trim() }).subscribe({
      next: () => {
        this.busy.set(null);
        this.suspendReason.set('');
        this.toast.success('Usuario suspendido.');
        this.load();
      },
      error: () => {
        this.busy.set(null);
        this.toast.error('No pudimos suspender al usuario.');
      },
    });
  }

  protected requestUsername(user: AdminUserDetail): void {
    this.busy.set('username');
    this.admin.requestUsernameChange(user.id, this.usernameNote().trim() || undefined).subscribe({
      next: () => {
        this.busy.set(null);
        this.usernameNote.set('');
        this.toast.success('Solicitud creada.');
        this.load();
      },
      error: () => {
        this.busy.set(null);
        this.toast.error('No pudimos crear la solicitud.');
      },
    });
  }

  protected approveUsername(user: AdminUserDetail): void {
    const request = user.usernameChangeRequest;
    if (!request) return;

    this.busy.set('username');
    this.admin.approveUsernameChange(request.id).subscribe({
      next: () => {
        this.busy.set(null);
        this.toast.success('Solicitud aprobada.');
        this.load();
      },
      error: () => {
        this.busy.set(null);
        this.toast.error('No pudimos aprobar la solicitud.');
      },
    });
  }

  protected rejectUsername(user: AdminUserDetail): void {
    const request = user.usernameChangeRequest;
    if (!request) return;

    this.busy.set('username');
    this.admin.rejectUsernameChange(request.id, this.usernameNote().trim() || undefined).subscribe({
      next: () => {
        this.busy.set(null);
        this.toast.success('Solicitud rechazada.');
        this.load();
      },
      error: () => {
        this.busy.set(null);
        this.toast.error('No pudimos rechazar la solicitud.');
      },
    });
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');

    this.admin.getUserDetail(this.id()).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.user.set(response.user);
      },
      error: () => {
        this.loading.set(false);
        this.user.set(null);
        this.error.set('No pudimos cargar el usuario.');
      },
    });
  }
}
