import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18nService } from '../../core/i18n/i18n.service';

@Component({
  selector: 'app-language-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      (click)="i18n.toggleLanguage()"
      [attr.aria-label]="ariaLabel()"
      [title]="ariaLabel()"
      class="inline-flex h-11 items-center gap-1.5 rounded-xl border border-border px-2.5 text-xs font-bold text-muted transition hover:border-accent/50 hover:text-text"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
      </svg>
      <span>{{ label() }}</span>
    </button>
  `,
})
export class LanguageToggleComponent {
  protected readonly i18n = inject(I18nService);

  protected readonly label = computed(() => (this.i18n.language() === 'es' ? 'EN' : 'ES'));
  protected readonly ariaLabel = computed(() =>
    this.i18n.t(
      this.i18n.language() === 'es' ? 'common.switchToEnglish' : 'common.switchToSpanish',
    ),
  );
}
