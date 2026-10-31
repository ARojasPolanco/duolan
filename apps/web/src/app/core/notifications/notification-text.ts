import type { AppNotification } from '../api/models/notification.model';
import type { I18nService } from '../i18n/i18n.service';

type NotificationSource = Pick<AppNotification, 'type' | 'title' | 'message'>;

export interface NotificationText {
  title: string;
  message: string;
}

export const localizeNotification = (
  i18n: I18nService,
  notification: NotificationSource,
): NotificationText => {
  if (notification.type === 'match_created') {
    return {
      title: i18n.t('notifications.matchCreated.title'),
      message: i18n.t('notifications.matchCreated.body'),
    };
  }

  return {
    title: notification.title,
    message: notification.message,
  };
};
