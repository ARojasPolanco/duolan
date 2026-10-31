import { COUNTRY_TIMEZONES, TIMEZONE } from '@duolan/shared/constants';
import type { Country, ScheduleSlot } from '../api/models/enums';

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

const BLOCK_RANGES: Record<ScheduleSlot, [number, number]> = {
  early: [0, 6],
  morning: [6, 12],
  afternoon: [12, 18],
  night: [18, 24],
};

const pad = (value: number): string => String(value).padStart(2, '0');

const clock = (minutes: number, isEnd = false): string => {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  if (isEnd && normalized === 0) return '24:00';
  return `${pad(Math.floor(normalized / 60))}:${pad(normalized % 60)}`;
};

export const getCountryOffsetMinutes = (country: Country | null): number => {
  if (!country) return 0;
  const timeZone = COUNTRY_TIMEZONES[country];
  if (!timeZone) return 0;
  const date = new Date();
  return offsetMinutes(timeZone, date) - offsetMinutes(TIMEZONE, date);
};

export const formatCountryOffset = (country: Country | null): string => {
  if (!country) return '';

  const diffMinutes = getCountryOffsetMinutes(country);
  if (diffMinutes === 0) return 'misma hora que LAN';

  const hours = diffMinutes / 60;
  const formatted = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 1 }).format(
    Math.abs(hours),
  );
  return `${hours > 0 ? '+' : '-'}${formatted} h vs. LAN`;
};

export const formatBlockRange = (slot: ScheduleSlot, country: Country | null): string => {
  const range = BLOCK_RANGES[slot];
  const diffMinutes = getCountryOffsetMinutes(country);
  return `${clock(range[0] * 60 + diffMinutes)}-${clock(range[1] * 60 + diffMinutes, true)}`;
};

export const formatDateTime = (value: string | Date, locale = 'es-MX'): string =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: TIMEZONE,
  }).format(new Date(value));

export const formatDate = (value: string | Date, locale = 'es-MX'): string =>
  new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: TIMEZONE,
  }).format(new Date(value));

export const formatTime = (value: string | Date, locale = 'es-MX'): string =>
  new Intl.DateTimeFormat(locale, {
    timeStyle: 'short',
    timeZone: TIMEZONE,
  }).format(new Date(value));

export const formatRelativeTime = (value: string | Date, locale = 'es-MX'): string => {
  const target = new Date(value).getTime();
  const diffSeconds = Math.round((target - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (Math.abs(diffSeconds) < 60) return formatter.format(diffSeconds, 'second');

  const diffMinutes = Math.round(diffSeconds / 60);
  if (Math.abs(diffMinutes) < 60) return formatter.format(diffMinutes, 'minute');

  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) return formatter.format(diffHours, 'hour');

  return formatter.format(Math.round(diffHours / 24), 'day');
};
