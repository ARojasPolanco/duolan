import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { Country } from '../../core/api/models/enums';
import { COUNTRY_LABELS } from '../../core/utils/labels';
import { formatCountryOffset } from '../../core/utils/time';

@Component({
  selector: 'app-country-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (country()) {
      <span
        class="inline-flex min-w-0 items-center gap-1"
        [title]="'Horarios en hora de Ciudad de México. ' + label() + ': ' + offset() + '.'"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          class="shrink-0"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
        </svg>
        <span class="truncate">{{ label() }} · {{ offset() }}</span>
      </span>
    }
  `,
})
export class CountryBadgeComponent {
  readonly country = input<Country | null>(null);

  protected readonly label = computed(() => {
    const country = this.country();
    return country ? COUNTRY_LABELS[country] : '';
  });
  protected readonly offset = computed(() => formatCountryOffset(this.country()));
}
