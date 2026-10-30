import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(I18nService);
  });

  it('arranca en español por defecto', () => {
    expect(service.language()).toBe('es');
    expect(service.t('common.home')).toBe('Inicio');
    expect(document.documentElement.lang).toBe('es-MX');
  });

  it('cambia a inglés, traduce y persiste la elección', () => {
    service.setLanguage('en');

    expect(service.language()).toBe('en');
    expect(service.t('common.home')).toBe('Home');
    expect(service.t('home.greeting', { name: 'mid' })).toBe('Hi, mid');
    expect(localStorage.getItem('duolan_language')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('alterna entre español e inglés', () => {
    service.toggleLanguage();
    expect(service.language()).toBe('en');

    service.toggleLanguage();
    expect(service.language()).toBe('es');
    expect(service.t('common.home')).toBe('Inicio');
  });
});
