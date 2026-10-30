export type GameServer = 'LAS' | 'LAN';
export type UserRole = 'player' | 'admin';
export type UserStatus = 'active' | 'suspended';
export type Role = 'top' | 'jungle' | 'mid' | 'adc' | 'support' | 'fill';
export type RankTier =
  | 'iron'
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'emerald'
  | 'diamond'
  | 'master'
  | 'grandmaster'
  | 'challenger';
export type RankDivision = 'iv' | 'iii' | 'ii' | 'i';
export type Queue = 'solo_duo' | 'flex';
export type PlayStyle = 'casual' | 'ranked' | 'tryhard';
export type Language = 'es' | 'en' | 'pt';
export type Country =
  'MX' | 'GT' | 'SV' | 'HN' | 'NI' | 'CR' | 'PA' | 'DO' | 'PR' | 'CO' | 'VE' | 'EC' | 'PE';

export const GAME_SERVERS: readonly GameServer[];
export const USER_ROLES: readonly UserRole[];
export const USER_STATUSES: readonly UserStatus[];
export const ROLES: readonly Role[];
export const RANK_TIERS: readonly RankTier[];
export const RANK_DIVISIONS: readonly RankDivision[];
export const QUEUES: readonly Queue[];
export const PLAY_STYLES: readonly PlayStyle[];
export const LANGUAGES: readonly Language[];
export const COUNTRIES: readonly Country[];
export const COUNTRY_TIMEZONES: Readonly<Record<Country, string>>;
export const SCHEDULE_DAYS: readonly string[];
export const SCHEDULE_BLOCKS: readonly string[];
export const SCHEDULE_BLOCK_VALUES: readonly string[];
export const TIMEZONE: string;
