import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { AdminLikeActivity, AdminLikesQuery } from '../../../core/api/models/admin.model';
import { AdminService } from '../../../core/api/admin.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { formatDateTime } from '../../../core/utils/time';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';
import { SkeletonComponent } from '../../../shared/ui/skeleton.component';

type LikeStatus = NonNullable<AdminLikesQuery['status']>;

const STATUS_LABELS: Record<LikeStatus, string> = {
  pending: 'Pendiente',
  matched: 'Match',
  cancelled: 'Retirado',
};

const STATUS_CLASS: Record<LikeStatus, string> = {
  pending: 'border-gold/40 bg-gold/10 text-gold',
  matched: 'border-success/40 bg-success/10 text-success',
  cancelled: 'border-border bg-surface-2 text-muted',
};

@Component({
  selector: 'app-admin-likes-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CardComponent, SkeletonComponent],
  template: `
    <div class="grid gap-5">
      <header>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Admin</p>
        <h1 class="mt-2 text-2xl font-extrabold sm:text-3xl">Likes</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          Historial de likes enviados entre jugadores. Los likes pendientes todavía no son un match.
        </p>
      </header>

      <app-card padding="sm">
        <form
          class="grid gap-3 sm:flex sm:flex-wrap sm:items-center"
          (submit)="applySearch($event)"
        >
          <input
            [value]="search()"
            (input)="setSearch($event)"
            maxlength="100"
            placeholder="Buscar por usuario emisor o receptor"
            class="min-h-11 min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text placeholder:text-muted/60"
          />
          <select
            [value]="status()"
            (change)="setStatus($event)"
            [class]="selectClass + ' w-full sm:w-auto'"
          >
            <option value="">Todos los estados</option>
            @for (option of statusOptions; track option) {
              <option [value]="option">{{ statusLabel(option) }}</option>
            }
          </select>
          <app-button type="submit" variant="secondary" size="sm" [loading]="loading()">
            Buscar
          </app-button>
          <app-button variant="ghost" size="sm" (click)="clearFilters()">Limpiar</app-button>
        </form>
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
      } @else if (likes().length) {
        <div class="grid gap-3">
          <div class="flex items-center justify-between gap-3 text-xs text-muted">
            <span>{{ total() }} likes encontrados</span>
            <span>Página {{ page() }} de {{ totalPages() }}</span>
          </div>

          <div class="grid gap-2">
            @for (like of likes(); track like.id) {
              <article
                class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface px-4 py-3.5"
              >
                <div class="min-w-0">
                  <p class="truncate text-sm font-semibold">
                    {{ like.from?.username || '—' }}
                    <span class="px-1 text-muted">→</span>
                    {{ like.to?.username || '—' }}
                  </p>
                  <p class="mt-1 text-[11px] text-muted">{{ format(like.createdAt) }}</p>
                </div>
                <span
                  class="shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold"
                  [class]="statusClass(like.status)"
                >
                  {{ statusLabel(like.status) }}
                </span>
              </article>
            }
          </div>

          <div class="flex items-center justify-center gap-2 pt-1">
            <app-button
              variant="secondary"
              size="sm"
              [disabled]="page() <= 1 || loading()"
              (click)="previousPage()"
            >
              Anterior
            </app-button>
            <app-button
              variant="secondary"
              size="sm"
              [disabled]="page() >= totalPages() || loading()"
              (click)="nextPage()"
            >
              Siguiente
            </app-button>
          </div>
        </div>
      } @else {
        <app-card padding="lg">
          <div class="py-6 text-center">
            <h2 class="font-bold">No hay likes con esos filtros</h2>
            <p class="mx-auto mt-2 max-w-md text-sm text-muted">
              Probá cambiar el estado o limpiar la búsqueda.
            </p>
          </div>
        </app-card>
      }
    </div>
  `,
})
export class AdminLikesPage implements OnInit {
  private readonly admin = inject(AdminService);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly i18n = inject(I18nService);

  protected readonly statusOptions: LikeStatus[] = ['pending', 'matched', 'cancelled'];
  protected readonly selectClass =
    'min-h-11 rounded-lg border border-border bg-bg px-3 py-2 text-xs text-text';

  protected readonly likes = signal<AdminLikeActivity[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly search = signal('');
  protected readonly status = signal<LikeStatus | ''>('');
  protected readonly page = signal(1);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(1);

  ngOnInit(): void {
    this.load();
  }

  protected applySearch(event: Event): void {
    event.preventDefault();
    this.page.set(1);
    this.load();
  }

  protected setSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected setStatus(event: Event): void {
    this.status.set((event.target as HTMLSelectElement).value as LikeStatus | '');
    this.page.set(1);
    this.load();
  }

  protected clearFilters(): void {
    this.search.set('');
    this.status.set('');
    this.page.set(1);
    this.load();
  }

  protected previousPage(): void {
    if (this.page() <= 1) return;
    this.page.update((page) => page - 1);
    this.load();
  }

  protected nextPage(): void {
    if (this.page() >= this.totalPages()) return;
    this.page.update((page) => page + 1);
    this.load();
  }

  protected statusLabel(status: string): string {
    return STATUS_LABELS[status as LikeStatus] ?? status;
  }

  protected statusClass(status: string): string {
    return STATUS_CLASS[status as LikeStatus] ?? STATUS_CLASS.cancelled;
  }

  protected format(value: string): string {
    return formatDateTime(value, this.i18n.locale());
  }

  private load(): void {
    this.loading.set(true);
    this.error.set('');

    this.admin
      .getLikes({
        ...(this.search().trim() ? { search: this.search().trim() } : {}),
        ...(this.status() ? { status: this.status() as LikeStatus } : {}),
        page: this.page(),
        limit: 20,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.likes.set(response.likes);
          this.page.set(response.pagination.page);
          this.total.set(response.pagination.total);
          this.totalPages.set(response.pagination.totalPages);
          this.loading.set(false);
        },
        error: () => {
          this.likes.set([]);
          this.loading.set(false);
          this.error.set('No pudimos cargar los likes.');
        },
      });
  }
}
