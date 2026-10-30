import type { Contact } from './common.model';
import type {
  ApplicationStatus,
  ConnectionSource,
  PostStatus,
  Queue,
  RankTier,
  Role,
} from './enums';
import type { PublicProfile } from './profile.model';

export interface DuoPost {
  id: string;
  queue: Queue;
  rolesNeeded: Role[];
  rankMinTier: RankTier;
  rankMaxTier: RankTier;
  note: string | null;
  status: PostStatus;
  expiresAt: string;
  createdAt: string;
  owner: PublicProfile;
  applicationsCount?: number;
}

export interface DuoPostsResponse {
  status: 'success';
  posts: DuoPost[];
}

export interface DuoPostResponse {
  status: 'success';
  post: DuoPost;
}

export interface DuoApplication {
  id: string;
  message: string | null;
  status: ApplicationStatus;
  createdAt: string;
  applicant: PublicProfile;
  score?: number;
}

export interface DuoApplicationsResponse {
  status: 'success';
  applications: DuoApplication[];
}

export interface CreateDuoPostRequest {
  queue: Queue;
  rolesNeeded: Role[];
  rankMinTier: RankTier;
  rankMaxTier: RankTier;
  note?: string;
}

export interface ApplyToDuoPostRequest {
  message?: string;
}

export interface DuoPostQuery {
  queue?: Queue;
  role?: Role;
  limit?: number;
}

export interface DuoApplicationResponse {
  status: 'success';
  application: DuoApplication;
}

export interface ApplicationAcceptedResponse extends DuoApplicationResponse {
  connection: {
    id: string;
    source: ConnectionSource;
    createdAt: string;
  };
  contact: Contact;
}
