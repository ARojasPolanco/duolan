import type { Contact } from './common.model';
import type { ApplicationStatus, AramMode, AramWindow, ConnectionSource } from './enums';
import type { PublicProfile } from './profile.model';

export interface AramPost {
  id: string;
  mode: AramMode;
  playersPresent: number;
  slotsNeeded: number;
  window: AramWindow;
  windowLabel?: string;
  hasMic: boolean;
  note: string | null;
  status: 'active' | 'filled' | 'expired' | 'cancelled';
  expiresAt: string;
  createdAt: string;
  isMine?: boolean;
  owner: PublicProfile;
  applicationsCount?: number;
  pendingApplicationsCount?: number;
  myApplicationStatus?: ApplicationStatus | null;
}

export interface AramResponse {
  status: 'success';
  posts: AramPost[];
}

export interface AramPostResponse {
  status: 'success';
  post: AramPost;
}

export interface AramMineResponse {
  status: 'success';
  post: AramPost | null;
  applications: AramApplication[];
  myApplications: AramApplication[];
}

export interface AramApplication {
  id: string;
  message: string | null;
  status: ApplicationStatus;
  createdAt: string;
  applicant?: PublicProfile;
  post?: AramPost;
}

export interface CreateAramPostRequest {
  mode: AramMode;
  playersPresent: number;
  slotsNeeded: number;
  window: AramWindow;
  hasMic: boolean;
  note?: string;
}

export interface ApplyToAramPostRequest {
  message?: string;
}

export interface AramQuery {
  mode?: AramMode;
  limit?: number;
}

export interface AramApplicationResponse {
  status: 'success';
  application: AramApplication;
}

export interface AramApplicationAcceptedResponse extends AramApplicationResponse {
  connection: {
    id: string;
    source: ConnectionSource;
    createdAt: string;
  };
  contact: Contact;
}
