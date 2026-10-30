import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="classes()" aria-hidden="true"></span>`,
})
export class SkeletonComponent {
  readonly variant = input<'text' | 'avatar' | 'card' | 'button'>('text');

  protected readonly classes = computed(() => {
    switch (this.variant()) {
      case 'avatar':
        return 'block h-12 w-12 animate-pulse rounded-xl bg-surface-2';
      case 'card':
        return 'block h-32 w-full animate-pulse rounded-2xl bg-surface-2';
      case 'button':
        return 'block h-11 w-28 animate-pulse rounded-xl bg-surface-2';
      default:
        return 'block h-4 w-full animate-pulse rounded-md bg-surface-2';
    }
  });
}
