import type {
  Country,
  FeedbackTag,
  Language,
  PlayStyle,
  Queue,
  RankDivision,
  RankTier,
  ReportReason,
  Role,
} from '../api/models/enums';
import type { TranslationKey } from './translations';
import type { ScheduleDay, ScheduleSlot } from '../api/models/enums';

export const ROLE_LABEL_KEYS: Record<Role, TranslationKey> = {
  top: 'label.role.top',
  jungle: 'label.role.jungle',
  mid: 'label.role.mid',
  adc: 'label.role.adc',
  support: 'label.role.support',
  fill: 'label.role.fill',
};

export const RANK_LABEL_KEYS: Record<RankTier, TranslationKey> = {
  iron: 'label.rank.iron',
  bronze: 'label.rank.bronze',
  silver: 'label.rank.silver',
  gold: 'label.rank.gold',
  platinum: 'label.rank.platinum',
  emerald: 'label.rank.emerald',
  diamond: 'label.rank.diamond',
  master: 'label.rank.master',
  grandmaster: 'label.rank.grandmaster',
  challenger: 'label.rank.challenger',
};

export const DIVISION_LABEL_KEYS: Record<RankDivision, TranslationKey> = {
  iv: 'label.division.iv',
  iii: 'label.division.iii',
  ii: 'label.division.ii',
  i: 'label.division.i',
};

export const STYLE_LABEL_KEYS: Record<PlayStyle, TranslationKey> = {
  casual: 'label.style.casual',
  ranked: 'label.style.ranked',
  tryhard: 'label.style.tryhard',
};

export const LANGUAGE_LABEL_KEYS: Record<Language, TranslationKey> = {
  es: 'label.language.es',
  en: 'label.language.en',
  pt: 'label.language.pt',
};

export const COUNTRY_LABEL_KEYS: Record<Country, TranslationKey> = {
  MX: 'label.country.MX',
  GT: 'label.country.GT',
  SV: 'label.country.SV',
  HN: 'label.country.HN',
  NI: 'label.country.NI',
  CR: 'label.country.CR',
  PA: 'label.country.PA',
  DO: 'label.country.DO',
  PR: 'label.country.PR',
  CO: 'label.country.CO',
  VE: 'label.country.VE',
  EC: 'label.country.EC',
  PE: 'label.country.PE',
};

export const QUEUE_LABEL_KEYS: Record<Queue, TranslationKey> = {
  solo_duo: 'label.queue.solo_duo',
  flex: 'label.queue.flex',
};

export const FEEDBACK_TAG_LABEL_KEYS: Record<FeedbackTag, TranslationKey> = {
  good_vibes: 'label.feedbackTag.good_vibes',
  communicative: 'label.feedbackTag.communicative',
  tryhard: 'label.feedbackTag.tryhard',
  punctual: 'label.feedbackTag.punctual',
  good_game: 'label.feedbackTag.good_game',
  toxicity: 'label.feedbackTag.toxicity',
  abandonment: 'label.feedbackTag.abandonment',
  fake_rank: 'label.feedbackTag.fake_rank',
  no_communication: 'label.feedbackTag.no_communication',
  other: 'label.feedbackTag.other',
};

export const REPORT_REASON_LABEL_KEYS: Record<ReportReason, TranslationKey> = {
  toxicity: 'label.reportReason.toxicity',
  fake_rank: 'label.reportReason.fake_rank',
  abandonment: 'label.reportReason.abandonment',
  spam: 'label.reportReason.spam',
  underage: 'label.reportReason.underage',
  other: 'label.reportReason.other',
};

export const DAY_LABEL_KEYS: Record<ScheduleDay, TranslationKey> = {
  mon: 'label.day.mon',
  tue: 'label.day.tue',
  wed: 'label.day.wed',
  thu: 'label.day.thu',
  fri: 'label.day.fri',
  sat: 'label.day.sat',
  sun: 'label.day.sun',
};

export const BLOCK_LABEL_KEYS: Record<ScheduleSlot, TranslationKey> = {
  early: 'label.block.early',
  morning: 'label.block.morning',
  afternoon: 'label.block.afternoon',
  night: 'label.block.night',
};
