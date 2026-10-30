import type { Reputation } from './common.model';
import type {
  Country,
  GameServer,
  Language,
  PlayStyle,
  Queue,
  RankDivision,
  RankTier,
  Role,
  ScheduleBlock,
} from './enums';

export interface PublicProfile {
  id: string;
  username: string;
  country: Country | null;
  primaryRole: Role;
  secondaryRole: Role;
  rankTier: RankTier;
  rankDivision: RankDivision | null;
  rankLp: number | null;
  rankSource: 'declared' | 'riot';
  flexRankTier: RankTier | null;
  flexRankDivision: RankDivision | null;
  flexRankLp: number | null;
  flexRankSource: 'declared' | 'riot';
  playStyle: PlayStyle;
  languages: Language[];
  hasMic: boolean;
  scheduleBlocks: ScheduleBlock[];
  bio: string | null;
  reputation: Reputation;
  availabilityActive: boolean;
  stats?: { connections: number };
  createdAt?: string;
}

export interface MyProfile extends PublicProfile {
  riotId: string;
  server: GameServer;
  discordTag: string | null;
  whatsapp: string | null;
  profileCompletedAt: string | null;
}

export interface ProfileCompleteness {
  completed: boolean;
  missing: string[];
}

export interface MyProfileResponse {
  status: 'success';
  profile: MyProfile | null;
  completeness: ProfileCompleteness;
}

export interface PublicProfileResponse {
  status: 'success';
  profile: PublicProfile;
}

export interface UpdateProfileRequest {
  riotId?: string;
  country?: Country | null;
  primaryRole?: Role;
  secondaryRole?: Role;
  rankTier?: RankTier;
  rankDivision?: RankDivision | null;
  rankLp?: number | null;
  flexRankTier?: RankTier | null;
  flexRankDivision?: RankDivision | null;
  flexRankLp?: number | null;
  playStyle?: PlayStyle;
  languages?: Language[];
  hasMic?: boolean;
  scheduleBlocks?: ScheduleBlock[];
  bio?: string | null;
  discordTag?: string | null;
  whatsapp?: string | null;
}

export interface ProfileQuery {
  queue?: Queue;
}

export interface UsernameChangeRequest {
  id: string;
  status: 'pending_user' | 'pending_admin' | 'approved' | 'rejected';
  currentUsername: string;
  proposedUsername: string | null;
  note: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export interface UsernameChangeResponse {
  status: 'success';
  currentUsername: string;
  request: UsernameChangeRequest | null;
}
