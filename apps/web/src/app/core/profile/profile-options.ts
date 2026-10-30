import {
  COUNTRIES,
  LANGUAGES,
  PLAY_STYLES,
  RANK_DIVISIONS,
  RANK_TIERS,
  ROLES,
} from '@duolan/shared/constants';
import type {
  Country,
  Language,
  PlayStyle,
  RankDivision,
  RankTier,
  Role,
  ScheduleBlock,
  ScheduleDay,
  ScheduleSlot,
} from '../api/models/enums';

export const PROFILE_ROLES = [...ROLES] as Role[];
export const PROFILE_RANK_TIERS = [...RANK_TIERS] as RankTier[];
export const PROFILE_RANK_DIVISIONS = [...RANK_DIVISIONS] as RankDivision[];
export const PROFILE_PLAY_STYLES = [...PLAY_STYLES] as PlayStyle[];
export const PROFILE_LANGUAGES = [...LANGUAGES] as Language[];
export const PROFILE_COUNTRIES = [...COUNTRIES] as Country[];

export const PROFILE_DAYS: ScheduleDay[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
export const PROFILE_BLOCKS: ScheduleSlot[] = ['early', 'morning', 'afternoon', 'night'];

export const BLOCK_HOURS: Record<ScheduleSlot, string> = {
  early: '00-06',
  morning: '06-12',
  afternoon: '12-18',
  night: '18-24',
};

export const APEX_TIERS: RankTier[] = ['master', 'grandmaster', 'challenger'];
export const isApexTier = (tier: string): boolean => APEX_TIERS.includes(tier as RankTier);

export const WEEKDAY_NIGHTS: ScheduleBlock[] = [
  'mon_night',
  'tue_night',
  'wed_night',
  'thu_night',
  'fri_night',
];

export const WEEKEND_BLOCKS: ScheduleBlock[] = [
  'sat_afternoon',
  'sat_night',
  'sun_afternoon',
  'sun_night',
];

export const RIOT_ID_REGEX = /^[\p{L}\p{N}][\p{L}\p{N} ._-]{1,14}[\p{L}\p{N}]#[A-Za-z0-9]{3,5}$/u;

export const cleanRiotId = (value: string): string =>
  value
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\u00A0/g, ' ')
    .trim();
