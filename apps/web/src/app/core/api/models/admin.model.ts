import type { ReportReason, ReportStatus, UserRole, UserStatus } from './enums';
import type { PublicProfile } from './profile.model';
import type { Report } from './trust.model';

export interface AdminOverview {
  status: 'success';
  usersActive: number;
  players: number;
  admins: number;
  registered7d: number;
  emailsVerified: number;
  profilesCompleted: number;
  suspended: number;
  pendingDeletions: number;
  openReports: number;
  activeMatches: number;
  activeAvailability: number;
  likesTotal: number;
  likesPending: number;
  likes24h: number;
  matchesTotal: number;
  matches24h: number;
  recentLikes: AdminActivityItem[];
  recentMatches: AdminActivityItem[];
  pendingUsernameChanges: number;
  recentUsernameChanges: AdminActivityItem[];
}

export interface AdminActivityItem {
  id: string;
  username: string;
  createdAt: string;
  detail?: string;
}

export interface AdminUserSummary {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  profileCompleted: boolean;
  createdAt: string;
  openReports: number;
  activeConnections: number;
  sanctions: number;
  profile: PublicProfile | null;
}

export interface AdminUsersResponse {
  status: 'success';
  users: AdminUserSummary[];
  page: number;
  limit: number;
  total: number;
}

export interface AdminUsersQuery {
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  account?: 'active' | 'pending_deletion' | 'deleted' | 'all';
  emailVerified?: boolean;
  profileCompleted?: boolean;
  page?: number;
  limit?: number;
}

export interface AdminReport extends Report {
  reporter: { id: string; username: string };
  reported: { id: string; username: string };
  resolvedAt?: string | null;
  resolution?: string | null;
  note?: string | null;
}

export interface AdminReportsResponse {
  status: 'success';
  reports: AdminReport[];
}

export interface AdminReportsQuery {
  status?: ReportStatus;
  reason?: ReportReason;
  priority?: boolean;
  limit?: number;
}

export interface AdminUserDetailResponse {
  status: 'success';
  user: AdminUserSummary;
  reports: AdminReport[];
  sanctions: AdminSanction[];
  availability: unknown | null;
  connections: AdminActivityItem[];
}

export interface AdminSanction {
  id: string;
  type: string;
  reason: string;
  createdAt: string;
  expiresAt: string | null;
}

export interface ResolveReportRequest {
  resolution: 'dismissed' | 'warned' | 'suspended_7d' | 'suspended_30d' | 'suspended_permanent';
  note?: string;
}

export interface WarnUserRequest {
  reason: string;
}

export interface SuspendUserRequest {
  days: 7 | 30 | null;
  reason: string;
}

export interface AdminMetricsSummary {
  status: 'success';
  from: string;
  to: string;
  metrics: {
    timeToFirstDuoHours: number | null;
    matchToGameRate: number | null;
    retention7d: number | null;
    peakConcurrentAvailability: number | null;
  };
}
