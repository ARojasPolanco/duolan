import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeTone = 'accent' | 'muted' | 'success' | 'danger' | 'gold';

@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="classes()"><ng-content /></span>`,
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('accent');

  protected readonly classes = computed(() => {
    const tones: Record<BadgeTone, string> = {
      accent: 'border-accent/40 bg-accent/10 text-accent',
      muted: 'border-border bg-surface-2 text-muted',
      success: 'border-success/40 bg-success/10 text-success',
      danger: 'border-danger/40 bg-danger/10 text-danger',
      gold: 'border-gold/40 bg-gold/10 text-gold',
    };

    return `inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.14em] ${tones[this.tone()]}`;
  });
}
