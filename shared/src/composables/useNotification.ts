import { ref } from 'vue';

export type NotificationVariant = 'dark' | 'primary' | 'danger';

export interface NotificationItem {
  id: string;
  title?: string;
  message: string;
  duration?: number;
  variant: NotificationVariant;
}

export interface NotificationOptions {
  title?: string;
  message: string;
  duration?: number;
  variant?: NotificationVariant | 'info' | 'success' | 'error';
}

const notifications = ref<NotificationItem[]>([]);
let notificationSeq = 0;

export function useNotification() {
  const notify = (options: NotificationOptions): string => {
    notificationSeq += 1;
    const id = `notif_${Date.now()}_${notificationSeq}`;
    const duration = options.duration ?? 4000;

    let variant: NotificationVariant = 'dark';
    if (options.variant === 'primary' || options.variant === 'success' || options.variant === 'info') {
      variant = 'primary';
    } else if (options.variant === 'danger' || options.variant === 'error') {
      variant = 'danger';
    }

    notifications.value.push({ id, title: options.title, message: options.message, duration, variant });

    return id;
  };

  const dismissNotification = (id: string): void => {
    notifications.value = notifications.value.filter((n) => n.id !== id);
  };

  const clearNotifications = (): void => {
    notifications.value = [];
  };

  return {
    notifications,
    notify,
    dismissNotification,
    clearNotifications,
  };
}
