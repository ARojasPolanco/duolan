import { COUNTRY_TIMEZONES, TIMEZONE } from '@duolan/shared/constants';
import type { Country } from '../api/models/enums';

const partsFormatterCache = new Map<string, Intl.DateTimeFormat>();

const formatterFor = (timeZone: string): Intl.DateTimeFormat => {
  const cached = partsFormatterCache.get(timeZone);
  if (cached) return cached;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  partsFormatterCache.set(timeZone, formatter);
  return formatter;
};

const offsetMinutes = (timeZone: string, date: Date): number => {
  const parts = formatterFor(timeZone).formatToParts(date);
  const values: Record<string, number> = {};

  for (const part of parts) {
    if (part.type !== 'literal') values[part.type] = Number(part.value);
  }

  const asUtc = Date.UTC(
    values['year'],
    values['month'] - 1,
    values['day'],
    values['hour'],
    values['minute'],
    values['second'],
  );

  return Math.round((asUtc - date.getTime()) / 60000);
};

export const formatCountryOffset = (country: Country | null): string => {
  if (!country) return '';

  const timeZone = COUNTRY_TIMEZONES[country];
  if (!timeZone) return '';

  const diffMinutes = offsetMinutes(timeZone, new Date()) - offsetMinutes(TIMEZONE, new Date());
  if (diffMinutes === 0) return 'misma hora';

  const hours = diffMinutes / 60;
  const formatted = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 }).format(
    Math.abs(hours),
  );
  return `${hours > 0 ? '+' : '−'}${formatted} h`;
};

export const formatDateTime = (value: string | Date): string =>
  new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: TIMEZONE,
  }).format(new Date(value));

export const formatDate = (value: string | Date): string =>
  new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeZone: TIMEZONE,
  }).format(new Date(value));

export const formatTime = (value: string | Date): string =>
  new Intl.DateTimeFormat('es-MX', {
    timeStyle: 'short',
    timeZone: TIMEZONE,
  }).format(new Date(value));

export const formatRelativeTime = (value: string | Date): string => {
  const target = new Date(value).getTime();
  const diffSeconds = Math.round((target - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat('es-MX', { numeric: 'auto' });

  if (Math.abs(diffSeconds) < 60) return formatter.format(diffSeconds, 'second');

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, 'minute');

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, 'hour');

  return formatter.format(Math.round(diffHours / 24), 'day');
};
