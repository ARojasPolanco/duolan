export type {
  Country,
  GameServer,
  Language,
  PlayStyle,
  Queue,
  RankDivision,
  RankTier,
  Role,
  UserRole,
  UserStatus,
} from '@duolan/shared/constants';

export type ScheduleDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export type ScheduleSlot = 'early' | 'morning' | 'afternoon' | 'night';
export type ScheduleBlock = `${ScheduleDay}_${ScheduleSlot}`;

export type ConnectionSource = 'like' | 'availability' | 'post' | 'aram';
export type ConnectionStatus = 'active' | 'archived';
export type LikeStatus = 'pending' | 'matched' | 'cancelled';
export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired';
export type PostStatus = 'active' | 'filled' | 'expired' | 'cancelled';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type AvailabilityStatus = 'active' | 'closed';
export type ReportReason = 'toxicity' | 'fake_rank' | 'abandonment' | 'spam' | 'underage' | 'other';
export type ReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';
export type Sentiment = 'positive' | 'negative';
export type FeedbackTag =
  | 'good_vibes'
  | 'communicative'
  | 'tryhard'
  | 'punctual'
  | 'good_game'
  | 'toxicity'
  | 'abandonment'
  | 'fake_rank'
  | 'no_communication'
  | 'other';
export type NotificationType =
  | 'match_created'
  | 'invite_received'
  | 'invite_accepted'
  | 'invite_declined'
  | 'invite_cancelled'
  | 'application_received'
  | 'application_accepted'
  | 'application_rejected'
  | 'application_withdrawn'
  | 'aram_application_received'
  | 'aram_application_accepted'
  | 'aram_application_rejected'
  | 'aram_application_withdrawn'
  | 'post_suggested'
  | 'feedback_revealed'
  | 'warning_received'
  | 'account_suspended'
  | 'username_change_requested'
  | 'username_change_suggested'
  | 'username_changed'
  | 'username_change_rejected'
  | 'match_reminder';
export type UsernameChangeStatus = 'pending_user' | 'pending_admin' | 'approved' | 'rejected';
export type AramMode = 'solo' | 'group';
export type AramWindow = 'now' | 'tonight';
