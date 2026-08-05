import { NotificationItem } from '@/types';
import { eventBus } from '../event-bus';

export class NotificationManager {
  private notifications: NotificationItem[] = [
    {
      id: 'n1',
      type: 'info',
      title: 'Spotify Playing',
      message: 'M83 - Midnight City',
      timestamp: Date.now() - 60000,
      read: false,
    },
    {
      id: 'n2',
      type: 'success',
      title: 'Downloads Complete',
      message: 'VSCodeSetup-x64-1.92.0.exe is ready',
      timestamp: Date.now() - 120000,
      read: false,
    },
  ];

  constructor() {
    eventBus.on('NOTIFICATION_RECEIVED', (item: NotificationItem) => {
      this.addNotification(item);
    });
  }

  public addNotification(item: Omit<NotificationItem, 'id' | 'timestamp' | 'read'> & { id?: string }) {
    const fullItem: NotificationItem = {
      id: item.id || Date.now().toString(),
      timestamp: Date.now(),
      read: false,
      ...item,
    };
    this.notifications = [fullItem, ...this.notifications];
    eventBus.emit('NOTIFICATIONS_UPDATED', this.notifications);
  }

  public getUnreadCount(): number {
    return this.notifications.filter((n) => !n.read).length;
  }

  public markAllAsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    eventBus.emit('NOTIFICATIONS_UPDATED', this.notifications);
  }

  public clearAll() {
    this.notifications = [];
    eventBus.emit('NOTIFICATIONS_UPDATED', this.notifications);
  }

  public getNotifications(): NotificationItem[] {
    return this.notifications;
  }
}

export const notificationManager = new NotificationManager();
