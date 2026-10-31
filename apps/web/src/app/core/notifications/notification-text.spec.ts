import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { I18nService } from '../i18n/i18n.service';
import { localizeNotification } from './notification-text';

describe('localizeNotification', () => {
  let i18n: I18nService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    i18n = TestBed.inject(I18nService);
  });

  it('traduce el match creado al inglés', () => {
    i18n.setLanguage('en');

    const text = localizeNotification(i18n, {
      type: 'match_created',
      title: 'Es un match',
      message: 'Ya pueden coordinar su duo.',
    });

    expect(text).toEqual({
      title: "It's a match",
      message: 'You can coordinate your duo now.',
    });
  });

  it('mantiene el texto del backend para tipos sin traducción', () => {
    i18n.setLanguage('en');

    const text = localizeNotification(i18n, {
      type: 'warning_received',
      title: 'Advertencia',
      message: 'Recibiste una advertencia.',
    });

    expect(text).toEqual({
      title: 'Advertencia',
      message: 'Recibiste una advertencia.',
    });
  });
});
