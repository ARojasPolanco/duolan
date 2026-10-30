import type { Contact } from './common.model';
import type { ConnectionSource, Queue, Role } from './enums';
import type { PublicProfile } from './profile.model';

export interface MatchBreakdown {
  schedule?: number;
  style?: number;
  language?: number;
  roles?: number;
  mic?: number;
  rank?: number;
  reputation?: number;
}

export interface Candidate {
  profile: PublicProfile;
  score: number;
  breakdown: MatchBreakdown;
  reasons: string[];
  availabilityActive: boolean;
}

export interface CandidatesResponse {
  status: 'success';
  candidates: Candidate[];
  total: number;
}

export interface LikeItem {
  id: string;
  status: 'pending' | 'matched' | 'cancelled';
  createdAt: string;
}

export interface LikeResponse {
  status: 'success';
  like: LikeItem;
  matched: boolean;
  connection: {
    id: string;
    source: ConnectionSource;
    createdAt: string;
    contact: Contact;
  } | null;
}

export interface OutgoingLike {
  id: string;
  createdAt: string;
  target: PublicProfile;
}

export interface OutgoingLikesResponse {
  status: 'success';
  outgoing: OutgoingLike[];
}

export type FeedbackStatusValue = 'pending' | 'submitted' | 'revealed';

export interface MatchFeedbackStatus {
  mine: FeedbackStatusValue;
  theirs: FeedbackStatusValue;
  revealed: boolean;
}

export interface Match {
  id: string;
  source: ConnectionSource;
  createdAt: string;
  contact: Contact;
  other: PublicProfile;
  feedback: MatchFeedbackStatus;
}

export interface MatchesResponse {
  status: 'success';
  matches: Match[];
}

export interface MatchResponse {
  status: 'success';
  match: Match;
}

export interface MatchReminder {
  show: boolean;
  pendingIncoming: number;
}

export interface MatchReminderResponse {
  status: 'success';
  reminder: MatchReminder;
}

export interface CandidateQuery {
  queue?: Queue;
  role?: Role;
  limit?: number;
}
