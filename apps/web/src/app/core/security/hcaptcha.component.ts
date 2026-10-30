import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { environment } from '../../../environments/environment';

interface HcaptchaApi {
  render(
    container: HTMLElement,
    options: {
      sitekey: string;
      theme: 'dark' | 'light';
      callback: (token: string) => void;
      'expired-callback': () => void;
      'error-callback': () => void;
    },
  ): string;
  reset(widgetId?: string): void;
  remove(widgetId: string): void;
}

declare global {
  interface Window {
    hcaptcha?: HcaptchaApi;
  }
}

let scriptPromise: Promise<HcaptchaApi> | null = null;

const loadHcaptcha = (): Promise<HcaptchaApi> => {
  if (window.hcaptcha) return Promise.resolve(window.hcaptcha);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<HcaptchaApi>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-duolan-hcaptcha]');
    const script = existing ?? document.createElement('script');

    const onLoad = () => {
      if (window.hcaptcha) resolve(window.hcaptcha);
      else reject(new Error('hCaptcha no se inicializó'));
    };

    script.addEventListener('load', onLoad, { once: true });
    script.addEventListener('error', () => reject(new Error('No se pudo cargar hCaptcha')), {
      once: true,
    });

    if (!existing) {
      script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset['duolanHcaptcha'] = 'true';
      document.head.appendChild(script);
    }
  });

  return scriptPromise;
};

@Component({
  selector: 'app-hcaptcha',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div #container class="flex min-h-20 justify-center" aria-live="polite"></div>`,
})
export class HcaptchaComponent implements AfterViewInit, OnDestroy {
  private readonly zone = inject(NgZone);
  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');

  readonly siteKey = input(environment.hcaptchaSiteKey);
  readonly verified = output<string>();
  readonly expired = output<void>();

  private widgetId: string | null = null;

  ngAfterViewInit(): void {
    if (!this.siteKey()) return;

    void loadHcaptcha()
      .then((hcaptcha) => {
        this.widgetId = hcaptcha.render(this.container().nativeElement, {
          sitekey: this.siteKey(),
          theme: 'dark',
          callback: (token) => this.zone.run(() => this.verified.emit(token)),
          'expired-callback': () => this.zone.run(() => this.expired.emit()),
          'error-callback': () => this.zone.run(() => this.expired.emit()),
        });
      })
      .catch(() => {
        this.zone.run(() => this.expired.emit());
      });
  }

  reset(): void {
    if (this.widgetId && window.hcaptcha) {
      window.hcaptcha.reset(this.widgetId);
    }
  }

  ngOnDestroy(): void {
    if (this.widgetId && window.hcaptcha) {
      window.hcaptcha.remove(this.widgetId);
    }
  }
}
