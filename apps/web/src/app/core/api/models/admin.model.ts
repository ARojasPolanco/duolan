import type {
  Country,
  Language,
  PlayStyle,
  Queue,
  RankDivision,
  RankTier,
  ReportReason,
  ReportStatus,
  Role,
  UserRole,
  UserStatus,
} from './enums';
import type { UsernameChangeRequest } from './profile.model';

export interface AdminProfileView {
  id: string;
  riotId?: string;
  server?: string;
  country: Country | null;
  primaryRole: Role;
  secondaryRole: Role;
  rankTier: RankTier;
  rankDivision: RankDivision | null;
  rankLp?: number | null;
  rankIndex?: number | null;
  flexRankTier: RankTier | null;
  flexRankDivision: RankDivision | null;
  flexRankLp?: number | null;
  flexRankIndex?: number | null;
  playStyle: PlayStyle;
  languages: Language[];
  hasMic: boolean;
  scheduleBlocks: string[];
  bio: string | null;
  discordTag?: string | null;
  whatsapp?: string | null;
  reputation: {
    score: number;
    positive: number;
    negative: number;
  };
  rankSource?: string;
  flexRankSource?: string;
  profileCompletedAt: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserCounts {
  openReports: number;
  activeConnections: number;
  sanctions: number;
}

export interface AdminUserSummary {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  warningCount: number;
  suspendedUntil: string | null;
  suspensionReason: string | null;
  lastLoginAt: string | null;
  lastActiveAt: string | null;
  isDeleted: boolean;
  deletionRequestedAt: string | null;
  deletionScheduledFor: string | null;
  createdAt: string;
  profileCompleted: boolean;
  profile: AdminProfileView | null;
  counts: AdminUserCounts;
}

export interface AdminUsersResponse {
  status: 'success';
  users: AdminUserSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
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

export interface AdminReport {
  id: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  priority: boolean;
  adminNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  reporter: { id: string; username: string } | null;
  reported: {
    id: string;
    username: string;
    status: UserStatus;
    warningCount: number;
    suspendedUntil: string | null;
  } | null;
  admin: { id: string; username: string } | null;
}

export interface AdminReportsResponse {
  status: 'success';
  reports: AdminReport[];
  total: number;
}

export interface AdminReportsQuery {
  status?: ReportStatus;
  reason?: ReportReason;
  priority?: boolean;
  limit?: number;
}

export interface AdminSanction {
  id: string;
  action: string;
  reason: string;
  expiresAt: string | null;
  createdAt: string;
  admin: { id: string; username: string } | null;
}

export interface AdminAvailability {
  id: string;
  roles: Role[];
  queue: Queue;
  note: string | null;
  startedAt: string;
  expiresAt: string;
}

export interface AdminUserDetail extends AdminUserSummary {
  stats: {
    openReports: number;
    totalReports: number;
    sanctions: number;
    activeConnections: number;
    totalConnections: number;
  };
  reports: AdminReport[];
  sanctions: AdminSanction[];
  availability: AdminAvailability | null;
  usernameChangeRequest: UsernameChangeRequest | null;
}

export interface AdminUserDetailResponse {
  status: 'success';
  user: AdminUserDetail;
}

export interface AdminLikeActivity {
  id: string;
  status: string;
  createdAt: string;
  from: { id: string; username: string } | null;
  to: { id: string; username: string } | null;
}

export interface AdminMatchActivity {
  id: string;
  source: string;
  status: string;
  createdAt: string;
  archivedAt: string | null;
  users: { id: string; username: string }[];
}

export interface AdminUsernameChangeActivity {
  id: string;
  suggestedUsername: string | null;
  createdAt: string;
  updatedAt: string;
  user: { id: string; username: string } | null;
}

export interface AdminOverview {
  users: number;
  players: number;
  admins: number;
  newUsers7d: number;
  emailVerified: number;
  profilesComplete: number;
  suspended: number;
  pendingDeletions: number;
  deletedUsers: number;
  openReports: number;
  activeConnections: number;
  activeAvailability: number;
  likesTotal: number;
  likesPending: number;
  likes24h: number;
  matchesTotal: number;
  matches24h: number;
  recentLikes: AdminLikeActivity[];
  recentMatches: AdminMatchActivity[];
  pendingUsernameChanges: number;
  recentUsernameChanges: AdminUsernameChangeActivity[];
}

export interface AdminOverviewResponse {
  status: 'success';
  overview: AdminOverview;
}

export interface AdminStreamStats {
  status: 'success';
  users: number;
  connections: number;
  tickets: number;
}

export interface AdminMetrics {
  timeToFirstDuo: {
    medianHours: number | null;
    players: number;
  };
  matchToGame: {
    rate: number | null;
    played: number;
    eligible: number;
  };
  retention7d: {
    rate: number | null;
    retained: number;
    cohortSize: number;
  };
  concurrentAvailability: {
    peak: number;
    p95: number;
  };
}

export interface AdminMetricsSummary {
  status: 'success';
  range: {
    from: string;
    to: string;
  };
  metrics: AdminMetrics;
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
