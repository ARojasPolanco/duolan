import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-landing-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main
      class="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <p
        class="rounded-full border border-accent px-3 py-1 text-xs font-bold tracking-widest text-accent"
      >
        BETA
      </p>
      <h1 class="text-4xl font-extrabold tracking-tight sm:text-6xl">
        Duo<span class="text-accent">LAN</span>
      </h1>
      <p class="max-w-xl text-base text-muted sm:text-lg">
        Encontrá tu duo de League of Legends en el servidor LAN y subí de elo.
      </p>
      <p class="text-sm text-muted">Scaffold de Fase 0. La landing completa llega en la Fase 3.</p>
    </main>
  `,
})
export class LandingPage {}
