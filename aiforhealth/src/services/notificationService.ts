import type { Notification, NotificationGroup, NotificationPreferences, NotificationStats } from '@/types/notification';
import { addDays, subDays, addHours, format } from 'date-fns';

// Mock notification data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'appointment-reminder',
    title: 'Upcoming Appointment Reminder',
    message: 'You have an appointment with Dr. Sarah Wilson tomorrow at 10:00 AM. Please arrive 15 minutes early.',
    priority: 'high',
    read: false,
    timestamp: addHours(new Date(), -2).toISOString(),
    actionUrl: '/app/appointments',
    actionLabel: 'View Appointment',
    metadata: {
      appointmentId: '1',
      doctorName: 'Dr. Sarah Wilson',
      appointmentDate: addDays(new Date(), 1).toISOString().split('T')[0],
      appointmentTime: '10:00',
      daysUntilAppointment: 1
    }
  },
  {
    id: '2',
    type: 'missed-appointment',
    title: 'Missed Appointment Alert',
    message: 'You missed your appointment with Dr. Michael Chen on January 12th. Please reschedule as soon as possible.',
    priority: 'urgent',
    read: false,
    timestamp: addHours(new Date(), -6).toISOString(),
    actionUrl: '/app/appointments/book',
    actionLabel: 'Reschedule Now',
    metadata: {
      appointmentId: '2',
      doctorName: 'Dr. Michael Chen',
      appointmentDate: subDays(new Date(), 2).toISOString().split('T')[0],
      appointmentTime: '14:30'
    }
  },
  {
    id: '3',
    type: 'follow-up',
    title: 'Follow-up Appointment Suggested',
    message: 'Based on your recent visit with Dr. Emily Rodriguez, a follow-up appointment is recommended within 2 weeks.',
    priority: 'medium',
    read: false,
    timestamp: addHours(new Date(), -12).toISOString(),
    actionUrl: '/app/appointments/book',
    actionLabel: 'Schedule Follow-up',
    metadata: {
      doctorName: 'Dr. Emily Rodriguez',
      appointmentDate: subDays(new Date(), 7).toISOString().split('T')[0]
    }
  },
  {
    id: '4',
    type: 'medication',
    title: 'Medication Reminder',
    message: 'Time to take your Lisinopril (10mg). Don\'t forget to take it with food.',
    priority: 'high',
    read: true,
    timestamp: addHours(new Date(), -1).toISOString(),
    metadata: {
      medicationName: 'Lisinopril'
    }
  },
  {
    id: '5',
    type: 'health-tip',
    title: 'Daily Health Tip',
    message: 'Stay hydrated! Aim for 8 glasses of water throughout the day to maintain optimal health.',
    priority: 'low',
    read: true,
    timestamp: addHours(new Date(), -8).toISOString()
  },
  {
    id: '6',
    type: 'appointment-reminder',
    title: 'Appointment in 3 Days',
    message: 'Reminder: You have an appointment with Dr. James Park on January 18th at 2:30 PM.',
    priority: 'medium',
    read: false,
    timestamp: addHours(new Date(), -24).toISOString(),
    actionUrl: '/app/appointments',
    actionLabel: 'View Details',
    metadata: {
      appointmentId: '3',
      doctorName: 'Dr. James Park',
      appointmentDate: addDays(new Date(), 3).toISOString().split('T')[0],
      appointmentTime: '14:30',
      daysUntilAppointment: 3
    }
  },
  {
    id: '7',
    type: 'system',
    title: 'New Feature Available',
    message: 'Try our new AI Symptom Checker to get personalized health guidance and recommendations.',
    priority: 'low',
    read: true,
    timestamp: addHours(new Date(), -48).toISOString(),
    actionUrl: '/app/symptom-checker',
    actionLabel: 'Try Now'
  },
  {
    id: '8',
    type: 'follow-up',
    title: 'Lab Results Available',
    message: 'Your recent lab results from Dr. Sarah Wilson are now available. Please review them and schedule a follow-up if needed.',
    priority: 'medium',
    read: false,
    timestamp: addHours(new Date(), -18).toISOString(),
    actionUrl: '/app/lab-results',
    actionLabel: 'View Results'
  }
];

const mockPreferences: NotificationPreferences = {
  email: true,
  push: true,
  sms: false,
  appointmentReminders: true,
  medicationReminders: true,
  healthTips: true,
  systemUpdates: false,
  reminderTiming: '1-day'
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    await delay(500);
    return [...mockNotifications].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  async getUnreadNotifications(): Promise<Notification[]> {
    await delay(300);
    return mockNotifications.filter(n => !n.read);
  },

  async getNotificationsByType(type: Notification['type']): Promise<Notification[]> {
    await delay(400);
    return mockNotifications.filter(n => n.type === type);
  },

  async getGroupedNotifications(): Promise<NotificationGroup[]> {
    await delay(600);
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
  },

  async markAsRead(notificationId: string): Promise<void> {
    await delay(200);
    const notification = mockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
    }
  },

  async markAllAsRead(): Promise<void> {
    await delay(300);
    mockNotifications.forEach(n => n.read = true);
  },

  async deleteNotification(notificationId: string): Promise<void> {
    await delay(200);
    const index = mockNotifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      mockNotifications.splice(index, 1);
    }
  },

  async getNotificationStats(): Promise<NotificationStats> {
    await delay(300);
    const notifications = mockNotifications;
    
    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = notifications.reduce((acc, n) => {
      acc[n.priority] = (acc[n.priority] || 0) + 1;
      return acc;
    }, { low: 0, medium: 0, high: 0, urgent: 0 });

    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType,
      byPriority
    };
  },

  async getPreferences(): Promise<NotificationPreferences> {
    await delay(200);
    return { ...mockPreferences };
  },

  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<void> {
    await delay(400);
    Object.assign(mockPreferences, preferences);
  },

  async createNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification> {
    await delay(300);
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString()
    };
    mockNotifications.unshift(newNotification);
    return newNotification;
  },

  // Generate upcoming appointment reminders
  async generateAppointmentReminders(): Promise<Notification[]> {
    await delay(500);
    
    // Mock upcoming appointments
    const upcomingAppointments = [
      {
        id: 'apt-1',
        doctorName: 'Dr. Sarah Wilson',
        date: addDays(new Date(), 1).toISOString().split('T')[0],
        time: '10:00'
      },
      {
        id: 'apt-2',
        doctorName: 'Dr. Michael Chen',
        date: addDays(new Date(), 3).toISOString().split('T')[0],
        time: '14:30'
      }
    ];

    const reminders: Notification[] = upcomingAppointments.map((apt, index) => ({
      id: `reminder-${apt.id}`,
      type: 'appointment-reminder',
      title: 'Upcoming Appointment Reminder',
      message: `You have an appointment with ${apt.doctorName} on ${format(new Date(apt.date), 'MMMM d')} at ${apt.time}. Please arrive 15 minutes early.`,
      priority: index === 0 ? 'high' : 'medium',
      read: false,
      timestamp: new Date().toISOString(),
      actionUrl: '/app/appointments',
      actionLabel: 'View Appointment',
      metadata: {
        appointmentId: apt.id,
        doctorName: apt.doctorName,
        appointmentDate: apt.date,
        appointmentTime: apt.time,
        daysUntilAppointment: index + 1
      }
    }));

    return reminders;
  }
};