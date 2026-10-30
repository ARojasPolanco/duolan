import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { BetaBadgeComponent } from '../../../shared/icons/beta-badge.component';
import { RiotDisclaimerComponent } from '../../../shared/legal/riot-disclaimer.component';

@Component({
  selector: 'app-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BetaBadgeComponent, RiotDisclaimerComponent],
  template: `
    <main class="mx-auto flex min-h-screen max-w-5xl flex-col px-5 py-8 sm:px-8">
      <header class="flex items-center justify-between gap-4">
        <a routerLink="/" class="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          Duo<span class="text-accent">LAN</span>
          <app-beta-badge />
        </a>
        <div class="flex items-center gap-2">
          @if (isAuthenticated()) {
            <a
              routerLink="/inicio"
              class="rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-bg transition hover:bg-accent-strong"
            >
              Ir a la app
            </a>
          } @else {
            <a
              routerLink="/login"
              class="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-text transition hover:border-accent/60"
            >
              Iniciar sesión
            </a>
          }
        </div>
      </header>

      <section class="flex flex-1 flex-col items-center justify-center py-16 text-center">
        <p
          class="rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-accent"
        >
          Beta abierta
        </p>
        <h1 class="mt-6 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-6xl">
          Encontrá tu duo en <span class="text-accent">LAN</span> y subí de elo
        </h1>
        <p class="mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
          Duo LAN conecta jugadores de League of Legends del servidor LAN por afinidad, horarios y
          objetivos. Gratis y solo para mayores de 18 años.
        </p>

        <div class="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            routerLink="/register"
            class="inline-flex items-center justify-center rounded-xl bg-accent px-5 py-3 text-sm font-bold text-bg transition hover:bg-accent-strong"
          >
            Crear cuenta
          </a>
          <a
            routerLink="/login"
            class="inline-flex items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-bold text-text transition hover:border-accent/60"
          >
            Ya tengo cuenta
          </a>
        </div>

        <div class="mt-12 grid w-full gap-3 text-left sm:grid-cols-3">
          <div class="rounded-2xl border border-border bg-surface p-5">
            <h2 class="text-sm font-bold text-accent">Match por afinidad</h2>
            <p class="mt-2 text-xs leading-relaxed text-muted">
              Candidatos por rango, roles, horarios, estilo e idioma.
            </p>
          </div>
          <div class="rounded-2xl border border-border bg-surface p-5">
            <h2 class="text-sm font-bold text-accent">Disponible ya</h2>
            <p class="mt-2 text-xs leading-relaxed text-muted">
              Abrí disponibilidad por 30 o 60 minutos y recibí invitaciones.
            </p>
          </div>
          <div class="rounded-2xl border border-border bg-surface p-5">
            <h2 class="text-sm font-bold text-accent">Busco 1</h2>
            <p class="mt-2 text-xs leading-relaxed text-muted">
              Publicá el lugar que falta y encontrá el jugador compatible.
            </p>
          </div>
        </div>
      </section>

      <footer class="mt-8 border-t border-border pt-4">
        <nav class="flex flex-wrap gap-x-4 text-[11px] font-semibold text-muted">
          <a routerLink="/como-funciona" class="inline-flex min-h-11 items-center hover:text-text">
            Cómo funciona
          </a>
          <a routerLink="/terminos" class="inline-flex min-h-11 items-center hover:text-text">
            Términos
          </a>
          <a routerLink="/privacidad" class="inline-flex min-h-11 items-center hover:text-text">
            Privacidad
          </a>
          <a routerLink="/aviso-riot" class="inline-flex min-h-11 items-center hover:text-text">
            Aviso de Riot
          </a>
        </nav>
        <app-riot-disclaimer class="mt-2 block max-w-4xl" />
        <p class="mt-2 text-[11px] text-muted">
          Duo LAN está en beta: pueden haber cambios y errores mientras lo probamos.
        </p>
      </footer>
    </main>
  `,
})
export class LandingPage {
  private readonly auth = inject(AuthService);
  protected readonly isAuthenticated = computed(() => this.auth.isAuthenticated());
}
