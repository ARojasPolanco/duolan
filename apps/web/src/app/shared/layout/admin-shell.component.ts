import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { initialsOf } from '../../core/utils/labels';
import { BetaBadgeComponent } from '../icons/beta-badge.component';

interface AdminLink {
  path: string;
  label: string;
}

const ADMIN_LINKS: AdminLink[] = [
  { path: '/admin', label: 'Resumen' },
  { path: '/admin/usuarios', label: 'Usuarios' },
  { path: '/admin/reportes', label: 'Reportes' },
  { path: '/admin/metrics', label: 'Métricas' },
];

@Component({
  selector: 'app-admin-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BetaBadgeComponent],
  template: `
    <div class="min-h-screen bg-bg text-text">
      <header class="sticky top-0 z-40 border-b border-border/70 bg-bg/90 backdrop-blur-xl">
        <div class="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:h-16 sm:px-6">
          <a
            routerLink="/admin"
            class="flex min-h-11 shrink-0 items-center gap-2 text-xl font-extrabold tracking-tight"
          >
            <span>Duo<span class="text-accent">LAN</span></span>
            <app-beta-badge />
            <span
              class="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent"
            >
              Admin
            </span>
          </a>

          <nav class="ml-4 hidden items-center gap-1 lg:flex" aria-label="Navegación admin">
            @for (link of adminLinks; track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-accent/15 text-accent"
                class="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-text"
              >
                {{ link.label }}
              </a>
            }
          </nav>

          <div class="ml-auto flex items-center gap-2">
            <span class="hidden max-w-40 truncate text-xs font-semibold text-muted sm:block">
              {{ user()?.username }}
            </span>
            <span
              class="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-[10px] font-extrabold text-accent"
              aria-hidden="true"
            >
              {{ initials() }}
            </span>
            <button
              type="button"
              (click)="logout()"
              class="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted transition hover:border-danger/50 hover:text-danger"
              aria-label="Cerrar sesión"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </div>

        <nav
          class="flex gap-1 overflow-x-auto border-t border-border/60 px-4 py-1 lg:hidden"
          aria-label="Navegación admin mobile"
        >
          @for (link of adminLinks; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="bg-accent/15 text-accent"
              class="inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 text-xs font-semibold text-muted transition"
            >
              {{ link.label }}
            </a>
          }
        </nav>
      </header>

      <main class="mx-auto max-w-6xl px-4 pb-12 pt-6 sm:px-6">
        <router-outlet />
        <footer class="mt-10 border-t border-border pt-4 text-[11px] font-semibold text-muted">
          Panel interno de Duo LAN
        </footer>
      </main>
    </div>
  `,
})
export class AdminShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly adminLinks = ADMIN_LINKS;
  protected readonly user = this.auth.user;
  protected readonly initials = computed(() => initialsOf(this.user()?.username));

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login'], { replaceUrl: true });
  }
}
