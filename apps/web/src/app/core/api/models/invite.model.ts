import type { Contact } from './common.model';
import type { ConnectionSource, InviteStatus, Queue, Role } from './enums';
import type { PublicProfile } from './profile.model';

export type InviteBox = 'incoming' | 'outgoing';

export interface Invite {
  id: string;
  status: InviteStatus;
  role: Role;
  message: string | null;
  expiresAt: string;
  createdAt: string;
  counterpart: PublicProfile;
  availability: {
    roles: Role[];
    queue: Queue;
  } | null;
}

export interface InvitesResponse {
  status: 'success';
  invites: Invite[];
}

export interface InviteAcceptResponse {
  status: 'success';
  connection: {
    id: string;
    source: ConnectionSource;
    createdAt: string;
  };
  contact: Contact;
}
