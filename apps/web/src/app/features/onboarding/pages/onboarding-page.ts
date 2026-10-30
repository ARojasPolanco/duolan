import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LanguageToggleComponent } from '../../../shared/ui/language-toggle.component';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { CardComponent } from '../../../shared/ui/card.component';

@Component({
  selector: 'app-onboarding-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, CardComponent, LanguageToggleComponent],
  template: `
    <main class="mx-auto flex min-h-screen max-w-2xl items-center px-5 py-10">
      <app-card padding="lg" class="w-full">
        <div class="mb-4 flex items-center justify-between gap-3">
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-accent">
            {{ i18n.t('onboarding.eyebrow') }}
          </p>
          <app-language-toggle />
        </div>
        <h1 class="text-2xl font-extrabold">{{ i18n.t('onboarding.title') }}</h1>
        <p class="mt-2 text-sm leading-relaxed text-muted">
          {{ i18n.t('onboarding.description') }}
        </p>

        <div class="mt-6 rounded-xl border border-border bg-bg p-4 text-sm">
          <p class="font-semibold">{{ user()?.username }}</p>
          <p class="text-xs text-muted">{{ user()?.email }}</p>
        </div>

        <div class="mt-6 flex flex-wrap gap-2">
          <app-button (click)="goHome()">{{ i18n.t('onboarding.goHome') }}</app-button>
          <app-button variant="secondary" (click)="logout()">
            {{ i18n.t('common.logout') }}
          </app-button>
        </div>
      </app-card>
    </main>
  `,
})
export class OnboardingPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly i18n = inject(I18nService);

  protected readonly user = this.auth.user;

  protected goHome(): void {
    void this.router.navigate(['/inicio']);
  }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login'], { replaceUrl: true });
  }
}
