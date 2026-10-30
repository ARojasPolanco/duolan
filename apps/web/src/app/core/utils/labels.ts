import type {
  Country,
  Language,
  PlayStyle,
  Queue,
  RankDivision,
  RankTier,
  Role,
} from '../api/models/enums';
import type { PublicProfile } from '../api/models/profile.model';

export const ROLE_LABELS: Record<Role, string> = {
  top: 'Top',
  jungle: 'Jungla',
  mid: 'Mid',
  adc: 'ADC',
  support: 'Support',
  fill: 'Comodín',
};

export const RANK_LABELS: Record<RankTier, string> = {
  iron: 'Hierro',
  bronze: 'Bronce',
  silver: 'Plata',
  gold: 'Oro',
  platinum: 'Platino',
  emerald: 'Esmeralda',
  diamond: 'Diamante',
  master: 'Maestro',
  grandmaster: 'Gran Maestro',
  challenger: 'Challenger',
};

export const DIVISION_LABELS: Record<RankDivision, string> = {
  iv: 'IV',
  iii: 'III',
  ii: 'II',
  i: 'I',
};

export const STYLE_LABELS: Record<PlayStyle, string> = {
  casual: 'Casual',
  ranked: 'Ranked en serio',
  tryhard: 'Tryhard',
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  es: 'Español',
  en: 'Inglés',
  pt: 'Portugués',
};

export const COUNTRY_LABELS: Record<Country, string> = {
  MX: 'México',
  GT: 'Guatemala',
  SV: 'El Salvador',
  HN: 'Honduras',
  NI: 'Nicaragua',
  CR: 'Costa Rica',
  PA: 'Panamá',
  DO: 'Rep. Dominicana',
  PR: 'Puerto Rico',
  CO: 'Colombia',
  VE: 'Venezuela',
  EC: 'Ecuador',
  PE: 'Perú',
};

export const QUEUE_LABELS: Record<Queue, string> = {
  solo_duo: 'Solo/Dúo',
  flex: 'Flex',
};

type RankProfile = Pick<
  PublicProfile,
  'rankTier' | 'rankDivision' | 'flexRankTier' | 'flexRankDivision'
>;

const formatRankValue = (tier: RankTier | null, division: RankDivision | null): string | null => {
  if (!tier) return null;
  const tierLabel = RANK_LABELS[tier];
  if (!tierLabel) return null;
  const divisionLabel = division ? DIVISION_LABELS[division] : null;
  return divisionLabel ? `${tierLabel} ${divisionLabel}` : tierLabel;
};

export const formatRank = (profile: RankProfile, queue?: Queue): string => {
  const soloRank = formatRankValue(profile.rankTier, profile.rankDivision) ?? 'Sin rango';
  const flexRank = formatRankValue(profile.flexRankTier, profile.flexRankDivision);

  if (queue === 'flex') return flexRank ?? `${soloRank} (Flex sin declarar)`;
  if (queue === 'solo_duo') return soloRank;
  return flexRank ? `${soloRank} · Flex ${flexRank}` : soloRank;
};

export const formatRoles = (
  profile: Pick<PublicProfile, 'primaryRole' | 'secondaryRole'>,
): string => {
  const primary = ROLE_LABELS[profile.primaryRole];
  const secondary = ROLE_LABELS[profile.secondaryRole];
  if (!primary) return 'Sin roles';
  return secondary ? `${primary} / ${secondary}` : primary;
};

export const initialsOf = (username: string | null | undefined): string => {
  if (!username) return '??';
  const parts = username.split(/[\s_-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
};
