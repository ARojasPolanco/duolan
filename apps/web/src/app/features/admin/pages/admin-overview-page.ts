import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type {
  AdminLikeActivity,
  AdminMatchActivity,
  AdminOverview,
} from '../../../core/api/models/admin.model';
import { AdminService } from '../../../core/api/admin.service';
import { formatDateTime } from '../../../core/utils/time';
import { CardComponent } from '../../../shared/ui/card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton.component';

interface OverviewCard {
  label: string;
  value: number;
  detail: string;
  link: string;
}

interface StatusMeta {
  label: string;
  className: string;
}

const LIKE_STATUS: Record<string, StatusMeta> = {
  pending: { label: 'Pendiente', className: 'border-gold/40 bg-gold/10 text-gold' },
  matched: { label: 'Match', className: 'border-success/40 bg-success/10 text-success' },
  cancelled: { label: 'Cancelado', className: 'border-border bg-surface-2 text-muted' },
};

const MATCH_STATUS: Record<string, StatusMeta> = {
  active: { label: 'Activo', className: 'border-success/40 bg-success/10 text-success' },
  archived: { label: 'Archivado', className: 'border-border bg-surface-2 text-muted' },
};

const MATCH_SOURCE: Record<string, string> = {
  like: 'Like',
  availability: 'Disponible ya',
  post: 'Busco 1',
  aram: 'ARAM',
};

@Component({
  selector: 'app-admin-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CardComponent, SkeletonComponent],
  template: `
    <div class="grid gap-5">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-accent">Admin</p>
          <h1 class="mt-1 text-2xl font-extrabold sm:text-3xl">Resumen general</h1>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Estado operativo de la comunidad, moderación y actividad del producto.
          </p>
        </div>
        <button
          type="button"
          (click)="load()"
          class="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-xs font-semibold text-muted transition hover:border-accent/60 hover:text-text"
        >
          Actualizar
        </button>
      </header>

      @if (error()) {
        <p class="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          {{ error() }}
        </p>
      }

      @if (loading()) {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <app-skeleton variant="card" />
          <app-skeleton variant="card" />
          <app-skeleton variant="card" />
        </div>
      } @else {
        <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          @for (card of cards(); track card.label) {
            <a
              [routerLink]="card.link"
              class="rounded-2xl border border-border bg-surface p-5 transition hover:border-accent/60 hover:bg-surface-2"
            >
              <p class="text-xs font-semibold text-muted">{{ card.label }}</p>
              <p class="mt-4 text-3xl font-extrabold">{{ card.value }}</p>
              <p class="mt-1 text-xs leading-relaxed text-muted">{{ card.detail }}</p>
            </a>
          }
        </div>
      }

      @if (overview(); as data) {
        @if (data.recentLikes.length || data.recentMatches.length) {
          <div class="grid gap-4 lg:grid-cols-2">
            <app-card padding="lg">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                    Actividad
                  </p>
                  <h2 class="mt-1 text-lg font-bold">Últimos likes</h2>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  class="text-accent"
                  aria-hidden="true"
                >
                  <path
                    d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"
                  />
                </svg>
              </div>

              <div class="mt-3 divide-y divide-border">
                @if (data.recentLikes.length) {
                  @for (like of data.recentLikes; track like.id) {
                    <div class="flex items-center justify-between gap-3 py-3">
                      <div class="min-w-0">
                        <p class="truncate text-sm font-semibold">
                          {{ like.from?.username || '—' }}
                          <span class="text-muted">→</span>
                          {{ like.to?.username || '—' }}
                        </p>
                        <p class="mt-1 text-xs text-muted">{{ formatDate(like.createdAt) }}</p>
                      </div>
                      <span
                        class="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold"
                        [class]="likeMeta(like).className"
                      >
                        {{ likeMeta(like).label }}
                      </span>
                    </div>
                  }
                } @else {
                  <p class="py-5 text-sm text-muted">Sin likes recientes.</p>
                }
              </div>
            </app-card>

            <app-card padding="lg">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                    Actividad
                  </p>
                  <h2 class="mt-1 text-lg font-bold">Últimos matches</h2>
                </div>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                  class="text-accent"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              </div>

              <div class="mt-3 divide-y divide-border">
                @if (data.recentMatches.length) {
                  @for (match of data.recentMatches; track match.id) {
                    <div class="flex items-center justify-between gap-3 py-3">
                      <div class="min-w-0">
                        <p class="truncate text-sm font-semibold">
                          {{ matchUsers(match) }}
                        </p>
                        <p class="mt-1 text-xs text-muted">
                          {{ sourceLabel(match.source) }} · {{ formatDate(match.createdAt) }}
                        </p>
                      </div>
                      <span
                        class="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold"
                        [class]="matchMeta(match).className"
                      >
                        {{ matchMeta(match).label }}
                      </span>
                    </div>
                  }
                } @else {
                  <p class="py-5 text-sm text-muted">Sin matches recientes.</p>
                }
              </div>
            </app-card>
          </div>
        }
      }

      @if (overview()?.recentUsernameChanges?.length) {
        <app-card padding="lg">
          <h2 class="text-lg font-bold">Cambios de username pendientes</h2>
          <div class="mt-4 grid gap-3">
            @for (request of overview()!.recentUsernameChanges; track request.id) {
              <div
                class="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-bg px-4 py-3"
              >
                <div>
                  <p class="text-sm font-semibold">
                    {{ request.user?.username || 'Usuario' }}
                    @if (request.suggestedUsername) {
                      → &#64;{{ request.suggestedUsername }}
                    }
                  </p>
                  <p class="text-xs text-muted">{{ formatDate(request.createdAt) }}</p>
                </div>
                @if (request.user) {
                  <a
                    [routerLink]="['/admin/usuarios', request.user.id]"
                    class="text-xs font-semibold text-accent hover:underline"
                  >
                    Revisar
                  </a>
                }
              </div>
            }
          </div>
        </app-card>
      }
    </div>
  `,
})
export class AdminOverviewPage implements OnInit {
  private readonly admin = inject(AdminService);

  protected readonly overview = signal<AdminOverview | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly cards = computed<OverviewCard[]>(() => {
    const overview = this.overview();
    if (!overview) return [];

    return [
      {
        label: 'Usuarios activos',
        value: overview.users,
        detail: `${overview.players} jugadores · ${overview.admins} admins`,
        link: '/admin/usuarios',
      },
      {
        label: 'Nuevos esta semana',
        value: overview.newUsers7d,
        detail: 'Altas de los últimos 7 días',
        link: '/admin/usuarios',
      },
      {
        label: 'Email verificado',
        value: overview.emailVerified,
        detail: 'Cuentas activas con email confirmado',
        link: '/admin/usuarios?emailVerified=true',
      },
      {
        label: 'Perfiles completos',
        value: overview.profilesComplete,
        detail: 'Jugadores listos para match',
        link: '/admin/usuarios?profileCompleted=true',
      },
      {
        label: 'Suspendidos',
        value: overview.suspended,
        detail: 'Cuentas con suspensión vigente',
        link: '/admin/usuarios?status=suspended',
      },
      {
        label: 'Reportes abiertos',
        value: overview.openReports,
        detail: 'Pendientes de revisión',
        link: '/admin/reportes',
      },
      {
        label: 'Usernames para revisar',
        value: overview.pendingUsernameChanges,
        detail: 'Propuestas esperando aprobación',
        link: '/admin',
      },
      {
        label: 'Matches activos',
        value: overview.activeConnections,
        detail: `${overview.matches24h} en 24 h · ${overview.matchesTotal} totales`,
        link: '/admin/usuarios',
      },
      {
        label: 'Likes enviados',
        value: overview.likesTotal,
        detail: `${overview.likes24h} en las últimas 24 h`,
        link: '/admin/usuarios',
      },
      {
        label: 'Likes pendientes',
        value: overview.likesPending,
        detail: 'Esperando respuesta',
        link: '/admin/usuarios',
      },
      {
        label: 'Disponibles ahora',
        value: overview.activeAvailability,
        detail: 'Sesiones de Disponible ya activas',
        link: '/admin/usuarios',
      },
      {
        label: 'Bajas pendientes',
        value: overview.pendingDeletions,
        detail: 'Cuentas dentro del plazo de 30 días',
        link: '/admin/usuarios?account=pending_deletion',
      },
    ];
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');

    this.admin.getOverview().subscribe({
      next: (response) => {
        this.overview.set(response.overview);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No pudimos cargar el resumen.');
      },
    });
  }

  protected likeMeta(like: AdminLikeActivity): StatusMeta {
    return (
      LIKE_STATUS[like.status] ?? {
        label: like.status,
        className: 'border-border bg-surface-2 text-muted',
      }
    );
  }

  protected matchMeta(match: AdminMatchActivity): StatusMeta {
    return (
      MATCH_STATUS[match.status] ?? {
        label: match.status,
        className: 'border-border bg-surface-2 text-muted',
      }
    );
  }

  protected matchUsers(match: AdminMatchActivity): string {
    return match.users.map((user) => user.username).join(' → ') || 'Match';
  }

  protected sourceLabel(source: string): string {
    return MATCH_SOURCE[source] ?? source;
  }

  protected formatDate(value: string): string {
    return formatDateTime(value, 'es-MX');
  }
}
