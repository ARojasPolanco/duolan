import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { AdminUserSummary, AdminUsersQuery } from '../../../core/api/models/admin.model';
import { AdminService } from '../../../core/api/admin.service';
import { formatDate } from '../../../core/utils/time';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton.component';

@Component({
  selector: 'app-admin-users-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, CardComponent, SkeletonComponent],
  template: `
    <div class="grid gap-5">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Admin</p>
          <h1 class="mt-2 text-2xl font-extrabold sm:text-3xl">Usuarios</h1>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Cuentas, perfiles, verificación, actividad y señales de moderación.
          </p>
        </div>
        <app-button variant="secondary" size="sm" (click)="load()">Actualizar</app-button>
      </header>

      <app-card padding="sm">
        <form class="grid gap-3 sm:grid-cols-2 xl:grid-cols-7" (submit)="searchUsers($event)">
          <input
            [value]="search()"
            (input)="setSearch($event)"
            maxlength="100"
            placeholder="Buscar username o email"
            class="min-h-11 rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text placeholder:text-muted/70 sm:col-span-2"
          />
          <select [value]="role()" (change)="setRole($event)" [class]="selectClass">
            <option value="">Todos los roles</option>
            <option value="player">Jugador</option>
            <option value="admin">Admin</option>
          </select>
          <select [value]="status()" (change)="setStatus($event)" [class]="selectClass">
            <option value="">Todos los estados</option>
            <option value="active">Activo</option>
            <option value="suspended">Suspendido</option>
          </select>
          <select [value]="account()" (change)="setAccount($event)" [class]="selectClass">
            <option value="active">Cuentas activas</option>
            <option value="pending_deletion">Baja pendiente</option>
            <option value="deleted">Eliminadas</option>
            <option value="all">Todas</option>
          </select>
          <select
            [value]="emailVerified()"
            (change)="setEmailVerified($event)"
            [class]="selectClass"
          >
            <option value="">Email: todos</option>
            <option value="true">Email verificado</option>
            <option value="false">Email pendiente</option>
          </select>
          <select
            [value]="profileCompleted()"
            (change)="setProfileCompleted($event)"
            [class]="selectClass"
          >
            <option value="">Perfil: todos</option>
            <option value="true">Perfil completo</option>
            <option value="false">Perfil incompleto</option>
          </select>
          <app-button type="submit" size="sm" [loading]="loading()">Buscar</app-button>
        </form>

        <div class="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
          <span> {{ pagination()?.total ?? 0 }} cuenta(s) </span>
          <span> Página {{ pagination()?.page ?? 1 }} de {{ pagination()?.totalPages ?? 1 }} </span>
        </div>
      </app-card>

      @if (error()) {
        <p class="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          {{ error() }}
        </p>
      }

      @if (loading()) {
        <div class="grid gap-2">
          <app-skeleton variant="card" />
          <app-skeleton variant="card" />
          <app-skeleton variant="card" />
        </div>
      } @else if (users().length) {
        <div class="grid gap-2">
          @for (user of users(); track user.id) {
            <a
              [routerLink]="['/admin/usuarios', user.id]"
              class="rounded-2xl border border-border bg-surface p-4 transition hover:border-accent/50 hover:bg-surface-2"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div class="min-w-0">
                  <div class="flex flex-wrap items-center gap-2">
                    <p class="truncate font-bold">&#64;{{ user.username }}</p>
                    <span
                      class="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                      [class]="roleClass(user)"
                    >
                      {{ user.role === 'admin' ? 'Admin' : 'Jugador' }}
                    </span>
                    <span
                      class="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
                      [class]="stateClass(user)"
                    >
                      {{ stateLabel(user) }}
                    </span>
                  </div>
                  <p class="mt-1 truncate text-xs text-muted">{{ user.email }}</p>
                  <p class="mt-1 text-[11px] text-muted">
                    Alta {{ format(user.createdAt) }} ·
                    {{ user.profileCompleted ? 'Perfil completo' : 'Perfil incompleto' }}
                  </p>
                </div>
                <div class="grid grid-cols-3 gap-2 text-center text-[10px] text-muted">
                  <span class="rounded-lg border border-border px-3 py-2">
                    <strong class="block text-sm text-text">{{ user.counts.openReports }}</strong>
                    Reportes
                  </span>
                  <span class="rounded-lg border border-border px-3 py-2">
                    <strong class="block text-sm text-text">
                      {{ user.counts.activeConnections }}
                    </strong>
                    Matches
                  </span>
                  <span class="rounded-lg border border-border px-3 py-2">
                    <strong class="block text-sm text-text">{{ user.counts.sanctions }}</strong>
                    Sanciones
                  </span>
                </div>
              </div>
            </a>
          }
        </div>

        <div class="flex items-center justify-between gap-3">
          <app-button
            variant="secondary"
            size="sm"
            [disabled]="page() <= 1"
            (click)="previousPage()"
          >
            Anterior
          </app-button>
          <app-button
            variant="secondary"
            size="sm"
            [disabled]="page() >= (pagination()?.totalPages ?? 1)"
            (click)="nextPage()"
          >
            Siguiente
          </app-button>
        </div>
      } @else {
        <app-card padding="lg">
          <div class="py-6 text-center">
            <h2 class="font-bold">No encontramos usuarios</h2>
            <p class="mx-auto mt-2 max-w-md text-sm text-muted">
              Probá cambiar la búsqueda o los filtros.
            </p>
          </div>
        </app-card>
      }
    </div>
  `,
})
export class AdminUsersPage implements OnInit {
  private readonly admin = inject(AdminService);

  protected readonly users = signal<AdminUserSummary[]>([]);
  protected readonly pagination = signal<{
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly search = signal('');
  protected readonly role = signal('');
  protected readonly status = signal('');
  protected readonly account = signal('active');
  protected readonly emailVerified = signal('');
  protected readonly profileCompleted = signal('');
  protected readonly page = signal(1);
  protected readonly selectClass =
    'min-h-11 rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text';

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');

    const query: AdminUsersQuery = {
      account: this.account() as AdminUsersQuery['account'],
      page: this.page(),
      limit: 20,
    };
    if (this.search().trim()) query.search = this.search().trim();
    if (this.role()) query.role = this.role() as AdminUsersQuery['role'];
    if (this.status()) query.status = this.status() as AdminUsersQuery['status'];
    if (this.emailVerified()) query.emailVerified = this.emailVerified() === 'true';
    if (this.profileCompleted()) query.profileCompleted = this.profileCompleted() === 'true';

    this.admin.getUsers(query).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.users.set(response.users);
        this.pagination.set(response.pagination);
      },
      error: () => {
        this.loading.set(false);
        this.users.set([]);
        this.error.set('No pudimos cargar los usuarios.');
      },
    });
  }

  protected searchUsers(event: Event): void {
    event.preventDefault();
    this.page.set(1);
    this.load();
  }

  protected setSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected setRole(event: Event): void {
    this.role.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
    this.load();
  }

  protected setStatus(event: Event): void {
    this.status.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
    this.load();
  }

  protected setAccount(event: Event): void {
    this.account.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
    this.load();
  }

  protected setEmailVerified(event: Event): void {
    this.emailVerified.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
    this.load();
  }

  protected setProfileCompleted(event: Event): void {
    this.profileCompleted.set((event.target as HTMLSelectElement).value);
    this.page.set(1);
    this.load();
  }

  protected previousPage(): void {
    if (this.page() <= 1) return;
    this.page.update((page) => page - 1);
    this.load();
  }

  protected nextPage(): void {
    if (this.page() >= (this.pagination()?.totalPages ?? 1)) return;
    this.page.update((page) => page + 1);
    this.load();
  }

  protected format(value: string): string {
    return formatDate(value, 'es-MX');
  }

  protected stateLabel(user: AdminUserSummary): string {
    if (user.isDeleted) return user.deletionScheduledFor ? 'Baja pendiente' : 'Eliminado';
    return user.status === 'suspended' ? 'Suspendido' : 'Activo';
  }

  protected stateClass(user: AdminUserSummary): string {
    return user.isDeleted || user.status === 'suspended'
      ? 'border-danger/40 bg-danger/10 text-danger'
      : 'border-success/40 bg-success/10 text-success';
  }

  protected roleClass(user: AdminUserSummary): string {
    return user.role === 'admin'
      ? 'border-gold/40 bg-gold/10 text-gold'
      : 'border-border bg-surface-2 text-muted';
  }
}
