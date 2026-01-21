import type { 
  Notification, 
  NotificationGroup, 
  NotificationPreferences, 
  NotificationStats 
} from '@/types/notification';
import apiAdapter from './apiAdapter';

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const notificationService = {
  /**
   * Get all notifications for the current user
   */
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await apiAdapter.notifications.getNotifications();
      return response.notifications.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  },

  /**
   * Get unread notifications
   */
  async getUnreadNotifications(): Promise<Notification[]> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter(n => !n.read);
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
      throw error;
    }
  },

  /**
   * Get notifications by type
   */
  async getNotificationsByType(type: Notification['type']): Promise<Notification[]> {
    try {
      const notifications = await this.getNotifications();
      return notifications.filter(n => n.type === type);
    } catch (error) {
      console.error(`Failed to fetch ${type} notifications:`, error);
      throw error;
    }
  },

  /**
   * Get notifications grouped by date
   */
  async getGroupedNotifications(): Promise<NotificationGroup[]> {
    try {
      const notifications = await this.getNotifications();
      
      const grouped = notifications.reduce((groups, notification) => {
        const date = new Date(notification.timestamp).toDateString();
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(notification);
        return groups;
      }, {} as Record<string, Notification[]>);

      return Object.entries(grouped).map(([date, notifications]) => ({
        date,
        notifications
      }));
    } catch (error) {
      console.error('Failed to group notifications:', error);
      throw error;
    }
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.put(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await api.put('/notifications/mark-all-read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  },

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  },

  /**
   * Get notification statistics
   */
  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const notifications = await this.getNotifications();
      
      const byType = notifications.reduce((acc, n) => {
        acc[n.type] = (acc[n.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const byPriority = notifications.reduce((acc, n) => {
        acc[n.priority] = (acc[n.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const unreadCount = notifications.filter(n => !n.read).length;
      const today = new Date().toISOString().split('T')[0];
      const todayCount = notifications.filter(n => n.timestamp.startsWith(today)).length;

      return {
        total: notifications.length,
        unread: unreadCount,
        today: todayCount,
        byType,
        byPriority
      };
    } catch (error) {
      console.error('Failed to get notification stats:', error);
      throw error;
    }
  },

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    try {
      const response = await api.get<ApiResponse<{ preferences: NotificationPreferences }>>('/notifications/preferences');
      return response.data.data.preferences;
    } catch (error) {
      console.error('Failed to fetch notification preferences:', error);
      // Return default preferences if API fails
      return {
        email: true,
        push: true,
        sms: false,
        appointmentReminders: true,
        medicationReminders: true,
        healthTips: true,
        systemUpdates: true,
        reminderTiming: '1-day'
      };
    }
  },

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    try {
      await api.put('/notifications/preferences', preferences);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw error;
    }
  },

  /**
   * Create a new notification (admin function)
   */
  async createNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification> {
    try {
      const response = await api.post<ApiResponse<{ notification: Notification }>>(
        '/notifications',
        notification
      );
      return response.data.data.notification;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  },

  /**
   * Generate upcoming appointment reminders (admin function)
   */
  async generateAppointmentReminders(): Promise<Notification[]> {
    try {
      const response = await api.post<ApiResponse<{ notifications: Notification[] }>>(
        '/notifications/generate-reminders'
      );
      return response.data.data.notifications;
    } catch (error) {
      console.error('Failed to generate appointment reminders:', error);
      throw error;
    }
  }
};