import { Injectable, inject } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  NotificationMutationResponse,
  NotificationsResponse,
  UnreadCountResponse,
} from './models/notification.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly api = inject(ApiService);

  list(): Observable<NotificationsResponse> {
    return this.api.get<NotificationsResponse>('/notifications');
  }

  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.api.get<UnreadCountResponse>('/notifications/unread-count');
  }

  markRead(notificationId: string): Observable<NotificationMutationResponse> {
    return this.api.patch<NotificationMutationResponse>(`/notifications/${notificationId}/read`);
  }

  markAllRead(): Observable<NotificationMutationResponse> {
    return this.api.patch<NotificationMutationResponse>('/notifications/read-all');
  }

  remove(notificationId: string): Observable<NotificationMutationResponse> {
    return this.api.delete<NotificationMutationResponse>(`/notifications/${notificationId}`);
  }
}
