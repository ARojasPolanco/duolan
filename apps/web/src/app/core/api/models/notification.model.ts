import type { ApiSuccess } from './common.model';
import type { NotificationType } from './enums';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: {
    url?: string;
    connectionId?: string;
    inviteId?: string;
    postId?: string;
    applicationId?: string;
    notificationId?: string;
    [key: string]: string | undefined;
  };
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  status: 'success';
  notifications: AppNotification[];
  unreadCount: number;
}

export interface UnreadCountResponse {
  status: 'success';
  unreadCount: number;
}

export interface NotificationMutationResponse extends ApiSuccess {
  notification?: AppNotification;
}
