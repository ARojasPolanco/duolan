import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';

@Component({
  selector: 'app-onboarding-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CardComponent],
  template: `
    <main class="mx-auto flex min-h-screen max-w-2xl items-center px-5 py-10">
      <app-card padding="lg" class="w-full">
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-accent">Onboarding</p>
        <h1 class="mt-2 text-2xl font-extrabold">Completá tu perfil de jugador</h1>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          El formulario completo de Riot ID, roles, rango, horarios y contacto llega en la Fase 3.
          Por ahora podés validar la sesión y los guards.
        </p>

        <div class="mt-6 rounded-xl border border-border bg-bg p-4 text-sm">
          <p class="font-semibold">{{ user()?.username }}</p>
          <p class="text-xs text-muted">{{ user()?.email }}</p>
        </div>

        <div class="mt-6 flex flex-wrap gap-2">
          <app-button (click)="goHome()">Ir a inicio</app-button>
          <app-button variant="secondary" (click)="logout()">Cerrar sesión</app-button>
        </div>
      </app-card>
    </main>
  `,
})
export class OnboardingPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly user = this.auth.user;

  protected goHome(): void {
    void this.router.navigate(['/inicio']);
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login'], { replaceUrl: true });
  }
}
