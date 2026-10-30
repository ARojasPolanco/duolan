import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { I18nService } from '../../../core/i18n/i18n.service';
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
          <p class="text-xs font-bold uppercase tracking-[0.18em] text-accent">
            {{ i18n.t('home.eyebrow') }}
          </p>
          <h1 class="mt-1 text-2xl font-extrabold sm:text-3xl">
            {{ i18n.t('home.greeting', { name: user()?.username ?? '' }) }}
          </h1>
          <p class="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {{ i18n.t('home.description') }}
          </p>
        </div>
        <app-button variant="secondary" routerLink="/perfil">
          {{ i18n.t('common.myProfile') }}
        </app-button>
      </header>

      @if (!profileCompleted()) {
        <app-card>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="font-bold">{{ i18n.t('home.completeProfileTitle') }}</h2>
              <p class="mt-1 text-sm text-muted">
                {{ i18n.t('home.completeProfileDescription') }}
              </p>
            </div>
            <app-button routerLink="/onboarding">
              {{ i18n.t('home.completeProfileCta') }}
            </app-button>
          </div>
        </app-card>
      }

      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <app-card>
          <h2 class="font-bold text-accent">{{ i18n.t('home.matchTitle') }}</h2>
          <p class="mt-2 text-sm leading-relaxed text-muted">
            {{ i18n.t('home.matchDescription') }}
          </p>
          <app-button class="mt-4" variant="secondary" size="sm" routerLink="/match">
            {{ i18n.t('home.matchCta') }}
          </app-button>
        </app-card>
        <app-card>
          <h2 class="font-bold text-accent">{{ i18n.t('home.availabilityTitle') }}</h2>
          <p class="mt-2 text-sm leading-relaxed text-muted">
            {{ i18n.t('home.availabilityDescription') }}
          </p>
          <app-button class="mt-4" variant="secondary" size="sm" routerLink="/disponible">
            {{ i18n.t('home.availabilityCta') }}
          </app-button>
        </app-card>
        <app-card>
          <h2 class="font-bold text-accent">{{ i18n.t('home.postsTitle') }}</h2>
          <p class="mt-2 text-sm leading-relaxed text-muted">
            {{ i18n.t('home.postsDescription') }}
          </p>
          <app-button class="mt-4" variant="secondary" size="sm" routerLink="/busco-1">
            {{ i18n.t('home.postsCta') }}
          </app-button>
        </app-card>
      </div>

      @if (isAdmin()) {
        <app-card>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 class="font-bold">{{ i18n.t('home.adminTitle') }}</h2>
              <p class="mt-1 text-sm text-muted">{{ i18n.t('home.adminDescription') }}</p>
            </div>
            <app-button routerLink="/admin">{{ i18n.t('home.adminCta') }}</app-button>
          </div>
        </app-card>
      }
    </div>
  `,
})
export class HomePage {
  private readonly auth = inject(AuthService);
  protected readonly i18n = inject(I18nService);

  protected readonly user = this.auth.user;
  protected readonly profileCompleted = computed(() => this.auth.profileCompleted());
  protected readonly isAdmin = computed(() => this.auth.isAdmin());
}
