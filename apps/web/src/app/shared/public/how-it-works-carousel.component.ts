import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import type { TranslationKey } from '../../core/i18n/translations';
import { I18nService } from '../../core/i18n/i18n.service';

interface CarouselSlide {
  image: string;
  altKey: TranslationKey;
  titleKey: TranslationKey;
  bodyKey: TranslationKey;
  pointKeys: [TranslationKey, TranslationKey];
  accentClass: string;
}

const SLIDES: CarouselSlide[] = [
  {
    image: '/illustrations/match.svg',
    altKey: 'carousel.match.alt',
    titleKey: 'carousel.match.title',
    bodyKey: 'carousel.match.body',
    pointKeys: ['carousel.match.point1', 'carousel.match.point2'],
    accentClass: 'text-accent',
  },
  {
    image: '/illustrations/available.svg',
    altKey: 'carousel.available.alt',
    titleKey: 'carousel.available.title',
    bodyKey: 'carousel.available.body',
    pointKeys: ['carousel.available.point1', 'carousel.available.point2'],
    accentClass: 'text-accent-strong',
  },
  {
    image: '/illustrations/busco-one.svg',
    altKey: 'carousel.posts.alt',
    titleKey: 'carousel.posts.title',
    bodyKey: 'carousel.posts.body',
    pointKeys: ['carousel.posts.point1', 'carousel.posts.point2'],
    accentClass: 'text-gold',
  },
  {
    image: '/illustrations/trust.svg',
    altKey: 'carousel.trust.alt',
    titleKey: 'carousel.trust.title',
    bodyKey: 'carousel.trust.body',
    pointKeys: ['carousel.trust.point1', 'carousel.trust.point2'],
    accentClass: 'text-success',
  },
];

@Component({
  selector: 'app-how-it-works-carousel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section
      class="overflow-hidden rounded-3xl border border-border bg-surface"
      aria-roledescription="carrusel"
      [attr.aria-label]="i18n.t('landing.howEyebrow')"
    >
      <div class="grid md:grid-cols-2">
        <div class="relative min-h-[220px] overflow-hidden bg-surface-2 md:min-h-[320px]">
          @for (slide of slides; track slide.image; let index = $index) {
            <img
              [src]="slide.image"
              [alt]="i18n.t(slide.altKey)"
              class="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
              [class.opacity-100]="active() === index"
              [class.opacity-0]="active() !== index"
            />
          }
        </div>

        <div class="flex flex-col justify-between p-6 sm:p-8">
          @if (activeSlide(); as slide) {
            <div>
              <p class="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                {{ i18n.t('landing.howEyebrow') }}
              </p>
              <h2 class="mt-2 text-2xl font-extrabold sm:text-3xl" [class]="slide.accentClass">
                {{ i18n.t(slide.titleKey) }}
              </h2>
              <p class="mt-3 text-sm leading-relaxed text-muted sm:text-base">
                {{ i18n.t(slide.bodyKey) }}
              </p>
              <ul class="mt-4 space-y-2 text-sm text-muted">
                @for (pointKey of slide.pointKeys; track pointKey) {
                  <li class="flex items-start gap-2">
                    <span class="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"></span>
                    {{ i18n.t(pointKey) }}
                  </li>
                }
              </ul>
            </div>
          }

          <div class="mt-6 flex items-center justify-between gap-3">
            <div
              class="flex items-center"
              role="tablist"
              [attr.aria-label]="i18n.t('landing.howEyebrow')"
            >
              @for (slide of slides; track slide.titleKey; let index = $index) {
                <button
                  type="button"
                  (click)="goTo(index)"
                  role="tab"
                  [attr.aria-label]="i18n.t(slide.titleKey)"
                  [attr.aria-selected]="active() === index"
                  class="group flex h-11 w-11 items-center justify-center"
                >
                  <span
                    class="block h-1.5 rounded-full transition-all"
                    [class.w-7]="active() === index"
                    [class.bg-accent]="active() === index"
                    [class.w-3]="active() !== index"
                    [class.bg-border]="active() !== index"
                  ></span>
                </button>
              }
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                (click)="previous()"
                class="rounded-full border border-border p-2 text-muted transition hover:border-accent hover:text-text"
                [attr.aria-label]="i18n.t('landing.howEyebrow')"
              >
                &#8249;
              </button>
              <button
                type="button"
                (click)="next()"
                class="rounded-full border border-border p-2 text-muted transition hover:border-accent hover:text-text"
                [attr.aria-label]="i18n.t('landing.howEyebrow')"
              >
                &#8250;
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
})
export class HowItWorksCarouselComponent implements OnDestroy {
  protected readonly i18n = inject(I18nService);
  protected readonly slides = SLIDES;
  protected readonly active = signal(0);
  protected readonly activeSlide = computed(() => this.slides[this.active()]);
  protected readonly paused = signal(false);

  private readonly timer = setInterval(() => {
    if (!this.paused()) this.next();
  }, 5500);

  ngOnDestroy(): void {
    clearInterval(this.timer);
  }

  @HostListener('mouseenter')
  @HostListener('focusin')
  protected pause(): void {
    this.paused.set(true);
  }

  @HostListener('mouseleave')
  @HostListener('focusout')
  protected resume(): void {
    this.paused.set(false);
  }

  protected goTo(index: number): void {
    this.active.set((index + this.slides.length) % this.slides.length);
  }

  protected next(): void {
    this.goTo(this.active() + 1);
  }

  protected previous(): void {
    this.goTo(this.active() - 1);
  }
}
