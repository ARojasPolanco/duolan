import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { I18nService } from '../../core/i18n/i18n.service';
import type { TranslationKey } from '../../core/i18n/translations';
import { initialsOf } from '../../core/utils/labels';
import { BetaBadgeComponent } from '../icons/beta-badge.component';
import { LanguageToggleComponent } from '../ui/language-toggle.component';

interface AdminLink {
  path: string;
  labelKey: TranslationKey;
}

const ADMIN_LINKS: AdminLink[] = [
  { path: '/admin', labelKey: 'common.adminOverview' },
  { path: '/admin/usuarios', labelKey: 'common.adminUsers' },
  { path: '/admin/reportes', labelKey: 'common.adminReports' },
  { path: '/admin/metrics', labelKey: 'common.adminMetrics' },
];

@Component({
  selector: 'app-admin-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    BetaBadgeComponent,
    LanguageToggleComponent,
  ],
  template: `
    <div class="min-h-screen bg-bg text-text">
      <header class="sticky top-0 z-40 border-b border-border/70 bg-bg/90 backdrop-blur-xl">
        <div
          class="mx-auto flex h-14 max-w-6xl min-w-0 items-center gap-2 px-4 sm:h-16 sm:gap-3 sm:px-6"
        >
          <a
            routerLink="/admin"
            class="flex min-h-11 shrink-0 items-center gap-2 text-lg font-extrabold tracking-tight sm:text-xl"
          >
            <span>Duo<span class="text-accent">LAN</span></span>
            <app-beta-badge />
            <span
              class="hidden rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-accent sm:inline"
            >
              {{ i18n.t('admin.eyebrow') }}
            </span>
          </a>

          <nav
            class="ml-4 hidden items-center gap-1 lg:flex"
            [attr.aria-label]="i18n.t('common.adminNav')"
          >
            @for (link of adminLinks; track link.path) {
              <a
                [routerLink]="link.path"
                routerLinkActive="bg-accent/15 text-accent"
                class="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-muted transition hover:bg-surface-2 hover:text-text"
              >
                {{ i18n.t(link.labelKey) }}
              </a>
            }
          </nav>

          <div class="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <app-language-toggle />
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
              [attr.aria-label]="i18n.t('common.logout')"
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
          [attr.aria-label]="i18n.t('common.adminNavMobile')"
        >
          @for (link of adminLinks; track link.path) {
            <a
              [routerLink]="link.path"
              routerLinkActive="bg-accent/15 text-accent"
              class="inline-flex min-h-11 shrink-0 items-center rounded-lg px-3 text-xs font-semibold text-muted transition"
            >
              {{ i18n.t(link.labelKey) }}
            </a>
          }
        </nav>
      </header>

      <main class="mx-auto w-full min-w-0 max-w-6xl px-4 pb-12 pt-6 sm:px-6">
        <router-outlet />
        <footer class="mt-10 border-t border-border pt-4 text-[11px] font-semibold text-muted">
          {{ i18n.t('common.adminPanelFooter') }}
        </footer>
      </main>
    </div>
  `,
})
export class AdminShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly i18n = inject(I18nService);
  protected readonly adminLinks = ADMIN_LINKS;
  protected readonly user = this.auth.user;
  protected readonly initials = computed(() => initialsOf(this.user()?.username));

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login'], { replaceUrl: true });
  }
}
