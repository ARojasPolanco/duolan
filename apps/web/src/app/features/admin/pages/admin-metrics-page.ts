import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import type { AdminMetrics } from '../../../core/api/models/admin.model';
import { AdminService } from '../../../core/api/admin.service';
import { CardComponent } from '../../../shared/ui/card.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton.component';

const dateValue = (date: Date): string =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

const defaultRange = (): { from: string; to: string } => {
  const to = new Date();
  return {
    from: dateValue(new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000)),
    to: dateValue(to),
  };
};

const number = (value: number): string =>
  new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 }).format(value);

const percent = (value: number | null): string =>
  value === null ? 'Sin datos' : `${Math.round(value * 100)}%`;

@Component({
  selector: 'app-admin-metrics-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent, ButtonComponent, SkeletonComponent],
  template: `
    <div class="grid gap-5">
      <header>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Admin</p>
        <h1 class="mt-2 text-2xl font-extrabold sm:text-3xl">Métricas</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Resumen de los KPIs del MVP y de ARAM calculado desde la base de datos.
        </p>
      </header>

      <app-card padding="sm">
        <div class="flex flex-wrap items-end gap-4">
          <label class="grid gap-1.5 text-xs font-semibold text-muted">
            Desde
            <input
              type="date"
              [value]="from()"
              (input)="setFrom($event)"
              class="min-h-11 rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text"
            />
          </label>
          <label class="grid gap-1.5 text-xs font-semibold text-muted">
            Hasta
            <input
              type="date"
              [value]="to()"
              (input)="setTo($event)"
              class="min-h-11 rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text"
            />
          </label>
          <app-button size="sm" [loading]="loading()" (click)="load()">Actualizar</app-button>
          <app-button variant="secondary" size="sm" (click)="reset()"> Últimos 30 días </app-button>
        </div>
      </app-card>

      @if (error()) {
        <p class="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          {{ error() }}
        </p>
      }

      @if (loading()) {
        <div class="grid gap-4 sm:grid-cols-2">
          <app-skeleton variant="card" />
          <app-skeleton variant="card" />
          <app-skeleton variant="card" />
          <app-skeleton variant="card" />
        </div>
      } @else if (metrics(); as metrics) {
        <div class="grid gap-4 sm:grid-cols-2">
          <app-card padding="lg">
            <p class="text-xs font-semibold text-muted">Tiempo al primer duo</p>
            <p class="mt-4 text-3xl font-extrabold">
              {{
                metrics.timeToFirstDuo.medianHours === null
                  ? 'Sin datos'
                  : number(metrics.timeToFirstDuo.medianHours) + ' h'
              }}
            </p>
            <p class="mt-1 text-xs text-muted">{{ metrics.timeToFirstDuo.players }} jugadores</p>
          </app-card>
          <app-card padding="lg">
            <p class="text-xs font-semibold text-muted">Match que termina en partida</p>
            <p class="mt-4 text-3xl font-extrabold">
              {{
                metrics.matchToGame.eligible === 0 ? 'Sin datos' : percent(metrics.matchToGame.rate)
              }}
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ metrics.matchToGame.played }} de {{ metrics.matchToGame.eligible }} conexiones
            </p>
          </app-card>
          <app-card padding="lg">
            <p class="text-xs font-semibold text-muted">Retención a 7 días</p>
            <p class="mt-4 text-3xl font-extrabold">
              {{
                metrics.retention7d.cohortSize === 0
                  ? 'Sin datos'
                  : percent(metrics.retention7d.rate)
              }}
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ metrics.retention7d.retained }} de {{ metrics.retention7d.cohortSize }} jugadores
            </p>
          </app-card>
          <app-card padding="lg">
            <p class="text-xs font-semibold text-muted">Simultáneos en Disponible</p>
            <p class="mt-4 text-3xl font-extrabold">
              {{ metrics.concurrentAvailability.peak }}
            </p>
            <p class="mt-1 text-xs text-muted">p95: {{ metrics.concurrentAvailability.p95 }}</p>
          </app-card>
          <app-card padding="lg">
            <p class="text-xs font-semibold text-muted">Conversión ARAM</p>
            <p class="mt-4 text-3xl font-extrabold">
              {{ percent(metrics.aram.conversionRate) }}
            </p>
            <p class="mt-1 text-xs text-muted">
              {{ metrics.aram.postsCreated }} publicaciones ·
              {{ metrics.aram.applicationsSent }} postulaciones ·
              {{ metrics.aram.applicationsAccepted }} aceptadas
            </p>
          </app-card>
        </div>
      }
    </div>
  `,
})
export class AdminMetricsPage implements OnInit {
  private readonly admin = inject(AdminService);

  protected readonly range = defaultRange();
  protected readonly from = signal(this.range.from);
  protected readonly to = signal(this.range.to);
  protected readonly metrics = signal<AdminMetrics | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly number = number;
  protected readonly percent = percent;

  ngOnInit(): void {
    this.load();
  }

  protected setFrom(event: Event): void {
    this.from.set((event.target as HTMLInputElement).value);
  }

  protected setTo(event: Event): void {
    this.to.set((event.target as HTMLInputElement).value);
  }

  protected reset(): void {
    const range = defaultRange();
    this.from.set(range.from);
    this.to.set(range.to);
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');

    const from = new Date(`${this.from()}T00:00:00`).toISOString();
    const to = new Date(`${this.to()}T23:59:59.999`).toISOString();

    this.admin.getMetricsSummary(from, to).subscribe({
      next: (response) => {
        this.loading.set(false);
        this.metrics.set(response.metrics);
      },
      error: () => {
        this.loading.set(false);
        this.metrics.set(null);
        this.error.set('No pudimos cargar las métricas.');
      },
    });
  }
}
