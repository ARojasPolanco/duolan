import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/ui/button.component';

@Component({
  selector: 'app-error-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent],
  template: `
    <main class="flex min-h-screen items-center justify-center bg-bg px-5 text-text">
      <div class="max-w-md text-center">
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-danger">Error</p>
        <h1 class="mt-3 text-2xl font-bold">Algo salió mal</h1>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          La app encontró un problema inesperado. Probá recargar la página o volver al inicio.
        </p>
        <div class="mt-6 flex justify-center gap-2">
          <app-button (click)="reload()">Recargar</app-button>
          <app-button variant="secondary" routerLink="/">Volver al inicio</app-button>
        </div>
      </div>
    </main>
  `,
})
export class ErrorPage {
  protected reload(): void {
    window.location.reload();
  }
}
