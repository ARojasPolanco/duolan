import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { I18nService } from '../../../core/i18n/i18n.service';
import { LEGAL_EN, LEGAL_ES } from '../../../core/legal/legal-content';
import { BetaBadgeComponent } from '../../../shared/icons/beta-badge.component';
import { RiotDisclaimerComponent } from '../../../shared/legal/riot-disclaimer.component';
import { LanguageToggleComponent } from '../../../shared/ui/language-toggle.component';

type LegalDocumentType = 'terms' | 'privacy' | 'riot';

@Component({
  selector: 'app-legal-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BetaBadgeComponent, RiotDisclaimerComponent, LanguageToggleComponent],
  template: `
    <main class="mx-auto max-w-4xl px-5 py-8 sm:px-8">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <a routerLink="/" class="flex items-center gap-2 text-xl font-extrabold tracking-tight">
          Duo<span class="text-accent">LAN</span>
          <app-beta-badge />
        </a>
        <div class="flex items-center gap-2">
          <app-language-toggle />
          <a
            routerLink="/"
            class="inline-flex min-h-11 items-center rounded-xl border border-border px-4 text-xs font-semibold text-muted transition hover:border-accent/50 hover:text-text"
          >
            {{ i18n.t('common.backHome') }}
          </a>
        </div>
      </header>

      <article class="mt-8">
        <h1 class="text-3xl font-extrabold sm:text-4xl">{{ document().title }}</h1>
        <p class="mt-2 text-xs font-semibold text-muted">
          {{ i18n.t('legal.updated', { date: document().updated }) }}
        </p>

        @if (i18n.isEnglish()) {
          <p
            class="mt-4 rounded-xl border border-gold/40 bg-gold/10 px-4 py-3 text-xs leading-relaxed text-gold"
          >
            {{ i18n.t('legal.englishNotice') }}
          </p>
        }

        <div class="mt-8 grid gap-6">
          @for (section of document().sections; track section.title) {
            <section>
              <h2 class="text-lg font-bold">{{ section.title }}</h2>
              <p class="mt-2 text-sm leading-relaxed text-muted">{{ section.body }}</p>
            </section>
          }
        </div>

        <app-riot-disclaimer class="mt-10 block border-t border-border pt-4" />
      </article>
    </main>
  `,
})
export class LegalPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);

  private readonly documentType: LegalDocumentType = this.resolveDocumentType();

  protected readonly document = computed(() => {
    const documents = this.i18n.isEnglish() ? LEGAL_EN : LEGAL_ES;
    return documents[this.documentType];
  });

  private resolveDocumentType(): LegalDocumentType {
    const value = this.route.snapshot.data['doc'];
    return value === 'privacy' || value === 'riot' ? value : 'terms';
  }
}
