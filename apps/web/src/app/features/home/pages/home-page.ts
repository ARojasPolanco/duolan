import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ButtonComponent, CardComponent],
  template: `
    <div class="grid gap-5">
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-accent">Inicio</p>
          <h1 class="mt-1 text-2xl font-extrabold sm:text-3xl">Hola, {{ user()?.username }}</h1>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Este es el shell de Duo LAN. Las pantallas sociales y el matching se conectan en las
            próximas fases.
          </p>
        </div>
        <app-button variant="secondary" routerLink="/perfil">Mi perfil</app-button>
      </header>

      @if (!profileCompleted()) {
        <app-card>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="font-bold">Completá tu perfil</h2>
              <p class="mt-1 text-sm text-muted">
                Necesitás cargar Riot ID, roles, rango y horarios para buscar duo.
              </p>
            </div>
            <app-button routerLink="/onboarding">Completar perfil</app-button>
          </div>
        </app-card>
      }

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <app-card>
          <h2 class="font-bold text-accent">Match</h2>
          <p class="mt-2 text-sm leading-relaxed text-muted">
            Candidatos por afinidad, likes y match mutuo.
          </p>
          <app-button class="mt-4" variant="secondary" size="sm" routerLink="/match">
            Ver candidatos
          </app-button>
        </app-card>
        <app-card>
          <h2 class="font-bold text-accent">Disponible ya</h2>
          <p class="mt-2 text-sm leading-relaxed text-muted">
            Abrí una ventana de 30 o 60 minutos y recibí invitaciones.
          </p>
          <app-button class="mt-4" variant="secondary" size="sm" routerLink="/disponible">
            Abrir disponibilidad
          </app-button>
        </app-card>
        <app-card>
          <h2 class="font-bold text-accent">Busco 1</h2>
          <p class="mt-2 text-sm leading-relaxed text-muted">
            Publicá el lugar que falta y revisá postulaciones.
          </p>
          <app-button class="mt-4" variant="secondary" size="sm" routerLink="/busco-1">
            Ver publicaciones
          </app-button>
        </app-card>
      </div>

      @if (isAdmin()) {
        <app-card>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="font-bold">Panel admin disponible</h2>
              <p class="mt-1 text-sm text-muted">Entrá al panel interno de moderación.</p>
            </div>
            <app-button routerLink="/admin">Abrir admin</app-button>
          </div>
        </app-card>
      }
    </div>
  `,
})
export class HomePage {
  private readonly auth = inject(AuthService);

  protected readonly user = this.auth.user;
  protected readonly profileCompleted = computed(() => this.auth.profileCompleted());
  protected readonly isAdmin = computed(() => this.auth.isAdmin());
}
