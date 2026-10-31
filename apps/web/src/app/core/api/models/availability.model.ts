import type { Queue, Role } from './enums';
import type { PublicProfile } from './profile.model';

export interface AvailabilitySession {
  id: string;
  roles: Role[];
  queue: Queue;
  note: string | null;
  status: 'active' | 'closed';
  startedAt: string;
  expiresAt: string;
}

export interface AvailabilityPlayer {
  profile: PublicProfile;
  session: AvailabilitySession;
  score: number;
  breakdown: {
    rank?: number;
    style?: number;
    language?: number;
    mic?: number;
    reputation?: number;
  };
}

export interface AvailabilityListResponse {
  status: 'success';
  players: AvailabilityPlayer[];
  total: number;
}

export interface AvailabilityMineResponse {
  status: 'success';
  session: AvailabilitySession | null;
}

export interface AvailabilitySessionResponse {
  status: 'success';
  session: AvailabilitySession;
}

export interface AvailabilityCloseResponse {
  status: 'success';
  message: string;
}

export interface CreateAvailabilityRequest {
  roles: Role[];
  queue: Queue;
  note?: string;
  ttlMinutes: 30 | 60;
}

export interface AvailabilityQuery {
  queue?: Queue;
  role?: Role;
  limit?: number;
}

export interface InviteFromAvailabilityRequest {
  role: Role;
  message?: string;
}
