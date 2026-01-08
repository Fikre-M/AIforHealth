import type {
  UserProfile,
  UserSettings,
  ProfileUpdateData,
  SettingsUpdateData,
  NotificationPreferences,
  AppointmentReminderSettings,
  AccessibilitySettings
} from '@/types/profile';
import api from './api';

// Default settings (fallback in case API doesn't return any)
const defaultNotificationPreferences: NotificationPreferences = {
  email: {
    appointments: true,
    reminders: true,
    healthTips: true,
    promotions: false,
    systemUpdates: true
  },
  push: {
    appointments: true,
    reminders: true,
    healthTips: false,
    promotions: false,
    systemUpdates: true
  },
  sms: {
    appointments: true,
    reminders: true,
    emergencyAlerts: true
  }
};

const defaultAppointmentReminders: AppointmentReminderSettings = {
  enabled: true,
  reminderTimes: [1440, 60, 15], // 1 day, 1 hour, 15 minutes
  methods: ['email', 'push']
};

const defaultAccessibilitySettings: AccessibilitySettings = {
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: true,
  colorBlindSupport: 'none',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
};

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const profileService = {
  /**
   * Get user profile
   */
  async getProfile(): Promise<UserProfile> {
    try {
      const response = await api.get<ApiResponse<{ user: UserProfile }>>('/auth/profile');
      return response.data.data.user;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
    try {
      const response = await api.put<ApiResponse<{ user: UserProfile }>>(
        '/auth/profile',
        data
      );
      return response.data.data.user;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  },

  /**
   * Upload profile avatar
   */
  async uploadAvatar(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await api.post<ApiResponse<{ avatarUrl: string }>>(
        '/auth/profile/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      return response.data.data.avatarUrl;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      throw error;
    }
  },

  /**
   * Get user settings
   */
  async getSettings(): Promise<UserSettings> {
    try {
      const response = await api.get<ApiResponse<{ settings: UserSettings }>>('/auth/settings');
      return response.data.data.settings;
    } catch (error) {
      console.error('Failed to fetch user settings:', error);
      // Return default settings if API fails
      return {
        id: 'default-settings',
        userId: '',
        notifications: defaultNotificationPreferences,
        appointmentReminders: defaultAppointmentReminders,
        accessibility: defaultAccessibilitySettings,
        privacy: {
          profileVisibility: 'private',
          shareDataForResearch: false,
          allowMarketing: false
        },
        updatedAt: new Date().toISOString()
      };
    }
  },

  /**
   * Update user settings
   */
  async updateSettings(data: SettingsUpdateData): Promise<UserSettings> {
    try {
      const response = await api.put<ApiResponse<{ settings: UserSettings }>>(
        '/auth/settings',
        data
      );
      return response.data.data.settings;
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<void> {
    try {
      await api.delete('/auth/account', {
        data: { password }
      });
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw error;
    }
  }
};
