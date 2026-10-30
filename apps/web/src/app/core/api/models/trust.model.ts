import type { FeedbackTag, ReportReason, ReportStatus, Sentiment } from './enums';
import type { PublicProfile } from './profile.model';

export interface Report {
  id: string;
  status: ReportStatus;
  reason: ReportReason;
  details?: string | null;
  priority: boolean;
  createdAt?: string;
}

export interface CreateReportRequest {
  reportedUserId: string;
  reason: ReportReason;
  details?: string;
}

export interface CreateReportResponse {
  status: 'success';
  report: Report;
  blocked: boolean;
}

export interface BlockedUser {
  id: string;
  username: string;
  blockedAt: string;
}

export interface BlocksResponse {
  status: 'success';
  blocks: BlockedUser[];
}

export interface BlockResponse {
  status: 'success';
  block: BlockedUser;
}

export interface Feedback {
  id: string;
  connectionId: string;
  sentiment: Sentiment;
  tags: FeedbackTag[];
  comment: string | null;
  createdAt: string;
}

export interface CreateFeedbackRequest {
  connectionId: string;
  sentiment: Sentiment;
  tags: FeedbackTag[];
  comment?: string;
}

export interface CreateFeedbackResponse {
  status: 'success';
  feedback: Feedback;
  revealed: boolean;
}

export interface PendingFeedback {
  connectionId: string;
  other: PublicProfile;
  expiresAt: string;
}

export interface PendingFeedbackResponse {
  status: 'success';
  pending: PendingFeedback[];
}

export interface ConnectionFeedbackResponse {
  status: 'success';
  revealed: boolean;
  mine: Feedback | null;
  theirs: Feedback | null;
  windowOpen: boolean;
  expiresAt: string;
}
