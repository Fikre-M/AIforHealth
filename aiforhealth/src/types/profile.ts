export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
  };
  avatar?: string;
  role: 'patient' | 'doctor' | 'admin';
  specialization?: string; // For doctors
  licenseNumber?: string; // For doctors
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  email: {
    appointments: boolean;
    reminders: boolean;
    healthTips: boolean;
    promotions: boolean;
    systemUpdates: boolean;
  };
  push: {
    appointments: boolean;
    reminders: boolean;
    healthTips: boolean;
    promotions: boolean;
    systemUpdates: boolean;
  };
  sms: {
    appointments: boolean;
    reminders: boolean;
    emergencyAlerts: boolean;
  };
}

export interface AppointmentReminderSettings {
  enabled: boolean;
  reminderTimes: number[]; // Minutes before appointment (e.g., [1440, 60, 15] for 1 day, 1 hour, 15 minutes)
  methods: ('email' | 'push' | 'sms')[];
  customMessage?: string;
}

export interface AccessibilitySettings {
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  reducedMotion: boolean;
  screenReader: boolean;
  keyboardNavigation: boolean;
  colorBlindSupport: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  language: string;
  timezone: string;
}

export interface UserSettings {
  id: string;
  userId: string;
  notifications: NotificationPreferences;
  appointmentReminders: AppointmentReminderSettings;
  accessibility: AccessibilitySettings;
  privacy: {
    profileVisibility: 'public' | 'private' | 'contacts-only';
    shareDataForResearch: boolean;
    allowMarketing: boolean;
  };
  updatedAt: string;
}

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };
  medicalInfo?: {
    bloodType?: string;
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
  };
}

export interface SettingsUpdateData {
  notifications?: Partial<NotificationPreferences>;
  appointmentReminders?: Partial<AppointmentReminderSettings>;
  accessibility?: Partial<AccessibilitySettings>;
  privacy?: {
    profileVisibility?: 'public' | 'private' | 'contacts-only';
    shareDataForResearch?: boolean;
    allowMarketing?: boolean;
  };
}