import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { initialsOf } from '../../core/utils/labels';
import { BetaBadgeComponent } from '../icons/beta-badge.component';
import { RiotDisclaimerComponent } from '../legal/riot-disclaimer.component';

interface ShellLink {
  path: string;
  label: string;
}

const PRIMARY_LINKS: ShellLink[] = [
  { path: '/inicio', label: 'Inicio' },
  { path: '/match', label: 'Match' },
  { path: '/aram', label: 'ARAM' },
  { path: '/disponible', label: 'Disponible' },
  { path: '/busco-1', label: 'Busco 1' },
  { path: '/matches', label: 'Matches' },
];

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    BetaBadgeComponent,
    RiotDisclaimerComponent,
  ],
  template: `
    <div class="min-h-screen bg-bg text-text">
      <header class="sticky top-0 z-40 border-b border-border/70 bg-bg/90 backdrop-blur-xl">
        <div class="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:h-16 sm:px-6">
          <a
            routerLink="/inicio"
            class="flex min-h-11 shrink-0 items-center gap-2 text-xl font-extrabold tracking-tight"
          >
            Duo<span class="text-accent">LAN</span>
            <app-beta-badge />
          </a>

          <nav class="ml-4 hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
            @for (link of primaryLinks; track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-accent/15 text-accent"
                class="rounded-lg px-3 py-2 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-text"
              >
                {{ link.label }}
              </a>
            }
            <a
              routerLink="/invitaciones"
              routerLinkActive="bg-accent/15 text-accent"
              class="rounded-lg px-3 py-2 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-text"
            >
              Invitaciones
            </a>
          </nav>

          <div class="ml-auto flex items-center gap-2">
            <a
              routerLink="/notificaciones"
              class="relative flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted transition hover:border-accent/50 hover:text-text"
              aria-label="Notificaciones"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                aria-hidden="true"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
            </a>

            <div class="relative">
              <button
                type="button"
                (click)="toggleMenu()"
                class="flex h-11 items-center gap-2 rounded-xl border border-border px-2 transition hover:border-accent/50"
                aria-haspopup="menu"
                [attr.aria-expanded]="menuOpen()"
                aria-label="Menú de cuenta"
              >
                <span
                  class="flex h-7 w-7 items-center justify-center rounded-lg bg-surface-2 text-[10px] font-extrabold text-accent"
                >
                  {{ initials() }}
                </span>
                <span class="hidden max-w-24 truncate text-xs font-semibold sm:block">
                  {{ user()?.username }}
                </span>
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="hidden text-muted sm:block"
                  [class.rotate-180]="menuOpen()"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              @if (menuOpen()) {
                <div
                  role="menu"
                  class="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/40"
                >
                  <div class="border-b border-border px-4 py-3">
                    <p class="truncate text-sm font-bold">{{ user()?.username }}</p>
                    <p class="truncate text-xs text-muted">{{ user()?.email }}</p>
                  </div>

                  <div class="p-1.5">
                    <a
                      routerLink="/perfil"
                      role="menuitem"
                      (click)="closeMenu()"
                      class="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-text"
                    >
                      Mi perfil
                    </a>
                    <a
                      routerLink="/como-funciona"
                      role="menuitem"
                      (click)="closeMenu()"
                      class="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-text"
                    >
                      Cómo funciona
                    </a>
                    <a
                      routerLink="/notificaciones"
                      role="menuitem"
                      (click)="closeMenu()"
                      class="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-text"
                    >
                      Notificaciones
                    </a>
                  </div>

                  <div class="border-t border-border p-1.5">
                    <button
                      type="button"
                      role="menuitem"
                      (click)="logout()"
                      class="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-text"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      </header>

      <main class="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pb-12">
        <router-outlet />

        <footer class="mt-10 border-t border-border pt-4">
          <nav class="flex flex-wrap gap-x-4 text-[11px] font-semibold text-muted">
            <a
              routerLink="/como-funciona"
              class="inline-flex min-h-11 items-center hover:text-text"
            >
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

      <nav
        class="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
        aria-label="Navegación mobile"
      >
        <div class="mx-auto flex max-w-2xl items-stretch">
          @for (link of primaryLinks; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="text-accent"
              class="flex min-h-14 flex-1 flex-col items-center justify-center px-1 text-[9px] font-semibold text-muted transition"
            >
              {{ link.label }}
            </a>
          }
        </div>
      </nav>
    </div>
  `,
})
export class AppShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly primaryLinks = PRIMARY_LINKS;
  protected readonly user = this.auth.user;
  protected readonly menuOpen = signal(false);
  protected readonly initials = computed(() => initialsOf(this.user()?.username));

  @HostListener('document:keydown.escape')
  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected logout(): void {
    this.menuOpen.set(false);
    this.auth.logout();
    void this.router.navigate(['/login'], { replaceUrl: true });
  }
}
