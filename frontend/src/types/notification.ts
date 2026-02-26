export interface Notification {
  id: string;
  type: 'appointment-reminder' | 'missed-appointment' | 'follow-up' | 'medication' | 'health-tip' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  read: boolean;
  timestamp: string;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: {
    appointmentId?: string;
    doctorName?: string;
    appointmentDate?: string;
    appointmentTime?: string;
    medicationName?: string;
    daysUntilAppointment?: number;
  };
}

export interface NotificationGroup {
  date: string;
  notifications: Notification[];
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  appointmentReminders: boolean;
  medicationReminders: boolean;
  healthTips: boolean;
  systemUpdates: boolean;
  reminderTiming: '1-hour' | '3-hours' | '1-day' | '2-days';
}

export interface NotificationStats {
  total: number;
  unread: number;
  today: number; // Add today property
  byType: {
    [key: string]: number;
  };
  byPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}