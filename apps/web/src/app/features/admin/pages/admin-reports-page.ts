import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import type { ReportReason, ReportStatus } from '../../../core/api/models/enums';
import type { AdminReport, ResolveReportRequest } from '../../../core/api/models/admin.model';
import { AdminService } from '../../../core/api/admin.service';
import { REPORT_REASON_LABEL_KEYS } from '../../../core/i18n/labels';
import { I18nService } from '../../../core/i18n/i18n.service';
import { ToastService } from '../../../core/toast/toast.service';
import { formatDateTime } from '../../../core/utils/time';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton.component';

const STATUS_LABELS: Record<ReportStatus, string> = {
  open: 'Abierto',
  reviewing: 'En revisión',
  resolved: 'Resuelto',
  dismissed: 'Descartado',
};

const STATUS_CLASS: Record<ReportStatus, string> = {
  open: 'border-gold/40 bg-gold/10 text-gold',
  reviewing: 'border-accent/40 bg-accent/10 text-accent',
  resolved: 'border-success/40 bg-success/10 text-success',
  dismissed: 'border-border bg-surface-2 text-muted',
};

const RESOLUTIONS: { value: ResolveReportRequest['resolution']; label: string }[] = [
  { value: 'dismissed', label: 'Descartar' },
  { value: 'warned', label: 'Advertir' },
  { value: 'suspended_7d', label: 'Suspender 7 días' },
  { value: 'suspended_30d', label: 'Suspender 30 días' },
  { value: 'suspended_permanent', label: 'Suspender permanente' },
];

@Component({
  selector: 'app-admin-reports-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CardComponent, SkeletonComponent],
  template: `
    <div class="grid gap-5">
      <header>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Admin</p>
        <h1 class="mt-2 text-2xl font-extrabold sm:text-3xl">Reportes y sanciones</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Revisá los reportes abiertos y aplicá una acción. Toda sanción queda registrada.
        </p>
      </header>

      <app-card padding="sm">
        <div class="grid gap-2 sm:flex sm:flex-wrap sm:items-center">
          <select
            [value]="status()"
            (change)="setStatus($event)"
            [class]="selectClass + ' w-full sm:w-auto'"
          >
            <option value="">Todos los estados</option>
            @for (key of statusOptions; track key) {
              <option [value]="key">{{ statusLabel(key) }}</option>
            }
          </select>
          <select
            [value]="reason()"
            (change)="setReason($event)"
            [class]="selectClass + ' w-full sm:w-auto'"
          >
            <option value="">Todos los motivos</option>
            @for (key of reasonOptions; track key) {
              <option [value]="key">{{ i18n.t(REASON_KEYS[key]) }}</option>
            }
          </select>
          <select
            [value]="priority()"
            (change)="setPriority($event)"
            [class]="selectClass + ' w-full sm:w-auto'"
          >
            <option value="">Todas las prioridades</option>
            <option value="true">Prioritarios</option>
            <option value="false">No prioritarios</option>
          </select>
          <app-button variant="secondary" size="sm" [loading]="loading()" (click)="load()">
            Recargar
          </app-button>
        </div>
      </app-card>

      @if (error()) {
        <p class="rounded-2xl border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          {{ error() }}
        </p>
      }

      @if (loading()) {
        <div class="grid gap-3">
          <app-skeleton variant="card" />
          <app-skeleton variant="card" />
        </div>
      } @else if (reports().length) {
        <div class="grid gap-3">
          @for (report of reports(); track report.id) {
            <article class="rounded-2xl border border-border bg-surface p-5">
              <div class="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div class="flex flex-wrap items-center gap-2">
                    <h2 class="font-bold">
                      {{ report.reporter?.username || 'Alguien' }} reportó a
                      {{ report.reported?.username || 'un jugador' }}
                    </h2>
                    <span
                      class="rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                      [class]="statusClass(report.status)"
                    >
                      {{ statusLabel(report.status) }}
                    </span>
                    @if (report.priority) {
                      <span
                        class="rounded-full border border-danger/40 bg-danger/10 px-2.5 py-1 text-[10px] font-semibold text-danger"
                      >
                        Prioritario
                      </span>
                    }
                  </div>
                  <p class="mt-1 text-xs text-muted">
                    {{ i18n.t(REASON_KEYS[report.reason]) }} · {{ format(report.createdAt) }}
                  </p>
                </div>
                <div class="text-right text-[11px] text-muted">
                  <p>Reportado: {{ report.reported?.status || 'Sin estado' }}</p>
                  <p>Advertencias: {{ report.reported?.warningCount ?? 0 }}</p>
                </div>
              </div>

              @if (report.details) {
                <p
                  class="mt-3 rounded-xl border border-border bg-bg px-3 py-2.5 text-sm text-muted"
                >
                  {{ report.details }}
                </p>
              }

              @if (report.admin) {
                <p class="mt-3 text-[11px] text-muted">
                  Resuelto por {{ report.admin.username }}
                  @if (report.adminNote) {
                    : {{ report.adminNote }}
                  }
                </p>
              }

              @if (report.status === 'open' || report.status === 'reviewing') {
                <div class="mt-4 grid gap-3">
                  <textarea
                    [value]="noteFor(report.id)"
                    (input)="setNote(report.id, $event)"
                    maxlength="500"
                    rows="2"
                    placeholder="Nota interna / motivo de la sanción (opcional)"
                    class="resize-none rounded-xl border border-border bg-bg px-3 py-2.5 text-xs text-text placeholder:text-muted/60"
                  ></textarea>
                  <div class="flex flex-wrap gap-2">
                    <select
                      [value]="resolutionFor(report.id)"
                      (change)="setResolution(report.id, $event)"
                      [class]="selectClass"
                    >
                      @for (option of resolutions; track option.value) {
                        <option [value]="option.value">{{ option.label }}</option>
                      }
                    </select>
                    <app-button
                      size="sm"
                      [loading]="busyId() === report.id"
                      (click)="resolve(report)"
                    >
                      Resolver
                    </app-button>
                  </div>
                </div>
              }
            </article>
          }
        </div>
      } @else {
        <app-card padding="lg">
          <div class="py-6 text-center">
            <h2 class="font-bold">No hay reportes con esos filtros</h2>
            <p class="mx-auto mt-2 max-w-md text-sm text-muted">
              Probá cambiar el estado, motivo o prioridad.
            </p>
          </div>
        </app-card>
      }
    </div>
  `,
})
export class AdminReportsPage implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly toast = inject(ToastService);
  protected readonly i18n = inject(I18nService);

  protected readonly REASON_KEYS = REPORT_REASON_LABEL_KEYS;
  protected readonly statusOptions: ReportStatus[] = ['open', 'reviewing', 'resolved', 'dismissed'];
  protected readonly reasonOptions = Object.keys(REPORT_REASON_LABEL_KEYS) as ReportReason[];
  protected readonly resolutions = RESOLUTIONS;
  protected readonly selectClass =
    'min-h-11 rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text';

  protected readonly reports = signal<AdminReport[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly status = signal<ReportStatus | ''>('open');
  protected readonly reason = signal<ReportReason | ''>('');
  protected readonly priority = signal('');
  protected readonly notes = signal<Record<string, string>>({});
  protected readonly resolutionsByReport = signal<
    Record<string, ResolveReportRequest['resolution']>
  >({});
  protected readonly busyId = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');

    this.admin
      .getReports({
        ...(this.status() ? { status: this.status() as ReportStatus } : {}),
        ...(this.reason() ? { reason: this.reason() as ReportReason } : {}),
        ...(this.priority() ? { priority: this.priority() === 'true' } : {}),
      })
      .subscribe({
        next: (response) => {
          this.loading.set(false);
          this.reports.set(response.reports);
        },
        error: () => {
          this.loading.set(false);
          this.reports.set([]);
          this.error.set('No pudimos cargar los reportes.');
        },
      });
  }

  protected setStatus(event: Event): void {
    this.status.set((event.target as HTMLSelectElement).value as ReportStatus | '');
    this.load();
  }

  protected setReason(event: Event): void {
    this.reason.set((event.target as HTMLSelectElement).value as ReportReason | '');
    this.load();
  }

  protected setPriority(event: Event): void {
    this.priority.set((event.target as HTMLSelectElement).value);
    this.load();
  }

  protected statusLabel(status: ReportStatus): string {
    return STATUS_LABELS[status] ?? status;
  }

  protected statusClass(status: ReportStatus): string {
    return STATUS_CLASS[status] ?? STATUS_CLASS.open;
  }

  protected format(value: string): string {
    return formatDateTime(value, this.i18n.locale());
  }

  protected noteFor(reportId: string): string {
    return this.notes()[reportId] ?? '';
  }

  protected setNote(reportId: string, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.notes.update((notes) => ({ ...notes, [reportId]: value }));
  }

  protected resolutionFor(reportId: string): ResolveReportRequest['resolution'] {
    return this.resolutionsByReport()[reportId] ?? 'dismissed';
  }

  protected setResolution(reportId: string, event: Event): void {
    const value = (event.target as HTMLSelectElement).value as ResolveReportRequest['resolution'];
    this.resolutionsByReport.update((resolutions) => ({ ...resolutions, [reportId]: value }));
  }

  protected resolve(report: AdminReport): void {
    this.busyId.set(report.id);

    this.admin
      .resolveReport(report.id, {
        resolution: this.resolutionFor(report.id),
        note: this.noteFor(report.id).trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.busyId.set(null);
          this.toast.success('Reporte resuelto.');
          this.load();
        },
        error: () => {
          this.busyId.set(null);
          this.toast.error('No pudimos resolver el reporte.');
        },
      });
  }
}
