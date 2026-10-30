export const USER_ROLES = Object.freeze(['player', 'admin']);
export const USER_STATUSES = Object.freeze(['active', 'suspended']);

export const GAME_SERVERS = Object.freeze(['LAS', 'LAN']);

export const RESERVED_USERNAMES = Object.freeze([
  'duolan',
  'duo_lan',
  'duolanoficial',
  'duolan_oficial',
  'duolas',
  'duo_las',
  'duolasoficial',
  'duolas_oficial',
  'admin',
  'administrador',
  'soporte',
  'support',
  'staff',
  'oficial',
  'official',
  'moderador',
  'mod',
  'sistema',
  'system',
  'riot',
  'riotgames',
  'leagueoflegends',
]);

export const USERNAME_CHANGE_STATUSES = Object.freeze([
  'pending_user',
  'pending_admin',
  'approved',
  'rejected',
]);

export const ROLES = Object.freeze(['top', 'jungle', 'mid', 'adc', 'support', 'fill']);

export const RANK_TIERS = Object.freeze([
  'iron',
  'bronze',
  'silver',
  'gold',
  'platinum',
  'emerald',
  'diamond',
  'master',
  'grandmaster',
  'challenger',
]);

export const RANK_DIVISIONS = Object.freeze(['iv', 'iii', 'ii', 'i']);

export const RANK_TIER_INDEX = Object.freeze(
  RANK_TIERS.reduce((acc, tier, index) => {
    acc[tier] = index;
    return acc;
  }, {})
);

export const RANK_DIVISION_INDEX = Object.freeze(
  RANK_DIVISIONS.reduce((acc, division, index) => {
    acc[division] = index;
    return acc;
  }, {})
);

export const RANK_SOURCES = Object.freeze(['declared', 'riot']);
export const QUEUES = Object.freeze(['solo_duo', 'flex']);
export const PLAY_STYLES = Object.freeze(['casual', 'ranked', 'tryhard']);
export const LANGUAGES = Object.freeze(['es', 'en', 'pt']);

export const COUNTRIES = Object.freeze([
  'MX',
  'GT',
  'SV',
  'HN',
  'NI',
  'CR',
  'PA',
  'DO',
  'PR',
  'CO',
  'VE',
  'EC',
  'PE',
]);

export const COUNTRY_TIMEZONES = Object.freeze({
  MX: 'America/Mexico_City',
  GT: 'America/Guatemala',
  SV: 'America/El_Salvador',
  HN: 'America/Tegucigalpa',
  NI: 'America/Managua',
  CR: 'America/Costa_Rica',
  PA: 'America/Panama',
  DO: 'America/Santo_Domingo',
  PR: 'America/Puerto_Rico',
  CO: 'America/Bogota',
  VE: 'America/Caracas',
  EC: 'America/Guayaquil',
  PE: 'America/Lima',
});

export const SCHEDULE_DAYS = Object.freeze(['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']);
export const SCHEDULE_BLOCKS = Object.freeze(['early', 'morning', 'afternoon', 'night']);
export const SCHEDULE_BLOCK_VALUES = Object.freeze(
  SCHEDULE_DAYS.flatMap((day) => SCHEDULE_BLOCKS.map((block) => `${day}_${block}`))
);

export const AVAILABILITY_STATUSES = Object.freeze(['active', 'closed']);
export const AVAILABILITY_CLOSED_REASONS = Object.freeze(['expired', 'manual', 'matched']);

export const LIKE_STATUSES = Object.freeze(['pending', 'matched', 'cancelled']);
export const CONNECTION_SOURCES = Object.freeze(['like', 'availability', 'post', 'aram']);
export const CONNECTION_STATUSES = Object.freeze(['active', 'archived']);

export const ARAM_MODES = Object.freeze(['solo', 'group']);
export const ARAM_WINDOWS = Object.freeze(['now', 'tonight']);

export const POST_STATUSES = Object.freeze(['active', 'filled', 'expired', 'cancelled']);
export const APPLICATION_STATUSES = Object.freeze(['pending', 'accepted', 'rejected', 'withdrawn']);
export const INVITE_STATUSES = Object.freeze([
  'pending',
  'accepted',
  'declined',
  'cancelled',
  'expired',
]);

export const REPORT_REASONS = Object.freeze([
  'toxicity',
  'fake_rank',
  'abandonment',
  'spam',
  'underage',
  'other',
]);
export const REPORT_STATUSES = Object.freeze(['open', 'reviewing', 'resolved', 'dismissed']);

export const SENTIMENTS = Object.freeze(['positive', 'negative']);
export const FEEDBACK_TAGS = Object.freeze([
  'good_vibes',
  'communicative',
  'tryhard',
  'punctual',
  'good_game',
  'toxicity',
  'abandonment',
  'fake_rank',
  'no_communication',
  'other',
]);

export const NOTIFICATION_TYPES = Object.freeze([
  'match_created',
  'invite_received',
  'invite_accepted',
  'invite_declined',
  'invite_cancelled',
  'application_received',
  'application_accepted',
  'application_rejected',
  'application_withdrawn',
  'aram_application_received',
  'aram_application_accepted',
  'aram_application_rejected',
  'aram_application_withdrawn',
  'post_suggested',
  'feedback_revealed',
  'warning_received',
  'account_suspended',
  'username_change_requested',
  'username_change_suggested',
  'username_changed',
  'username_change_rejected',
  'match_reminder',
]);

export const METRIC_EVENT_TYPES = Object.freeze([
  'user_registered',
  'email_verified',
  'profile_completed',
  'availability_opened',
  'availability_closed',
  'like_sent',
  'match_created',
  'contact_revealed',
  'invite_sent',
  'invite_accepted',
  'post_created',
  'application_sent',
  'application_accepted',
  'aram_post_created',
  'aram_application_sent',
  'aram_application_accepted',
  'feedback_submitted',
  'feedback_revealed',
  'report_created',
  'user_suspended',
  'push_subscribed',
  'match_reminder_sent',
]);

export const RANK_TOLERANCE = Object.freeze({
  solo_duo: 4,
  flex: 8,
});

export const TIMEZONE = 'America/Mexico_City';
