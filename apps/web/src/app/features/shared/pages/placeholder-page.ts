import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';
import { I18nService } from '../../../core/i18n/i18n.service';
import { CardComponent } from '../../../shared/ui/card.component';

interface PlaceholderData {
  title?: string;
  description?: string;
}

@Component({
  selector: 'app-placeholder-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CardComponent],
  template: `
    <div class="grid gap-5">
      <header>
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-accent">
          {{ i18n.t('placeholder.eyebrow') }}
        </p>
        <h1 class="mt-1 text-2xl font-extrabold sm:text-3xl">{{ title() }}</h1>
      </header>

      <app-card>
        <p class="text-sm leading-relaxed text-muted">
          {{ description() }}
        </p>
        <p class="mt-4 text-xs text-muted">{{ i18n.t('placeholder.pending') }}</p>
      </app-card>
    </div>
  `,
})
export class PlaceholderPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly i18n = inject(I18nService);
  private readonly data = toSignal(this.route.data.pipe(map((value) => value as PlaceholderData)), {
    initialValue: this.route.snapshot.data as PlaceholderData,
  });

  protected readonly title = computed(
    () => this.data().title ?? this.i18n.t('placeholder.fallbackTitle'),
  );
  protected readonly description = computed(
    () => this.data().description ?? this.i18n.t('placeholder.fallbackDescription'),
  );
}
