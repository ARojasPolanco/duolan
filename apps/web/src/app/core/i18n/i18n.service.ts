import { Injectable, computed, signal } from '@angular/core';
import { EN, ES, type TranslationKey } from './translations';

export type Language = 'es' | 'en';
type TranslationParams = Record<string, string | number>;

const LANGUAGE_KEY = 'duolan_language';

const readStoredLanguage = (): Language => {
  try {
    return localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'es';
  } catch {
    return 'es';
  }
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly _language = signal<Language>(readStoredLanguage());

  readonly language = this._language.asReadonly();
  readonly isEnglish = computed(() => this._language() === 'en');

  constructor() {
    this.applyDocumentLanguage(this._language());
  }

  setLanguage(language: Language): void {
    this._language.set(language);
    try {
      localStorage.setItem(LANGUAGE_KEY, language);
    } catch {
      // Storage can be unavailable in private mode; the in-memory language still works.
    }
    this.applyDocumentLanguage(language);
  }

  toggleLanguage(): void {
    this.setLanguage(this._language() === 'es' ? 'en' : 'es');
  }

  t(key: TranslationKey, params?: TranslationParams): string {
    const dictionary = this._language() === 'en' ? EN : ES;
    let text: string = dictionary[key] ?? ES[key] ?? key;

    if (params) {
      for (const [name, value] of Object.entries(params)) {
        text = text.replaceAll(`{${name}}`, String(value));
      }
    }

    return text;
  }

  private applyDocumentLanguage(language: Language): void {
    if (typeof document === 'undefined') return;
    document.documentElement.lang = language === 'en' ? 'en' : 'es-MX';
  }
}
