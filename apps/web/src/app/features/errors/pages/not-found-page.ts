import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/ui/button.component';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent],
  template: `
    <main class="flex min-h-screen items-center justify-center bg-bg px-5 text-text">
      <div class="max-w-md text-center">
        <p class="text-6xl font-extrabold tracking-tight text-accent">404</p>
        <h1 class="mt-3 text-2xl font-bold">No encontramos esta página</h1>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          El enlace puede estar roto o la pantalla todavía no existe.
        </p>
        <div class="mt-6 flex justify-center gap-2">
          <app-button routerLink="/">Volver al inicio</app-button>
          <app-button variant="secondary" routerLink="/inicio">Ir a la app</app-button>
        </div>
      </div>
    </main>
  `,
})
export class NotFoundPage {}
