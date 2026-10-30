import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CardComponent } from '../../../shared/ui/card.component';

@Component({
  selector: 'app-admin-overview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent],
  template: `
    <div class="grid gap-5">
      <header>
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-accent">Admin</p>
        <h1 class="mt-1 text-2xl font-extrabold sm:text-3xl">Resumen</h1>
        <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          El panel de métricas, usuarios y reportes se conecta en la Fase 5. El shell y los guards
          de admin ya están activos.
        </p>
      </header>

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <app-card>
          <p class="text-xs font-semibold text-muted">Usuarios activos</p>
          <p class="mt-2 text-2xl font-extrabold">—</p>
        </app-card>
        <app-card>
          <p class="text-xs font-semibold text-muted">Matches activos</p>
          <p class="mt-2 text-2xl font-extrabold">—</p>
        </app-card>
        <app-card>
          <p class="text-xs font-semibold text-muted">Reportes abiertos</p>
          <p class="mt-2 text-2xl font-extrabold">—</p>
        </app-card>
        <app-card>
          <p class="text-xs font-semibold text-muted">Disponibles ahora</p>
          <p class="mt-2 text-2xl font-extrabold">—</p>
        </app-card>
      </div>

      <app-card>
        <h2 class="font-bold">Conexión con la API</h2>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          Cuando se implemente el dashboard, esta pantalla consumirá
          <code class="rounded bg-bg px-1 py-0.5 text-xs">GET /admin/overview</code> y mostrará
          actividad en vivo.
        </p>
      </app-card>
    </div>
  `,
})
export class AdminOverviewPage {}
