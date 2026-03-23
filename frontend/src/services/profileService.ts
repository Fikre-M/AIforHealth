import type {
  UserProfile,
  UserSettings,
  ProfileUpdateData,
  SettingsUpdateData,
  NotificationPreferences,
  AppointmentReminderSettings,
  AccessibilitySettings,
} from '@/types/profile';
import api from './api';

const defaultNotificationPreferences: NotificationPreferences = {
  email: {
    appointments: true,
    reminders: true,
    healthTips: true,
    promotions: false,
    systemUpdates: true,
  },
  push: {
    appointments: true,
    reminders: true,
    healthTips: false,
    promotions: false,
    systemUpdates: true,
  },
  sms: {
    appointments: true,
    reminders: true,
    emergencyAlerts: true,
  },
};

const defaultAppointmentReminders: AppointmentReminderSettings = {
  enabled: true,
  reminderTimes: [1440, 60, 15],
  methods: ['email', 'push'],
};

const defaultAccessibilitySettings: AccessibilitySettings = {
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,
  screenReader: false,
  keyboardNavigation: true,
  colorBlindSupport: 'none',
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

interface ApiResponse<T> {
  data: T;
  message?: string;
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    const response = await api.get<ApiResponse<{ user: UserProfile }>>('/auth/profile');
    return response.data.data.user;
  },

  async updateProfile(data: ProfileUpdateData): Promise<UserProfile> {
    // Strip empty nested objects to avoid overwriting with blanks
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.phone !== undefined) payload.phone = data.phone;
    if (data.dateOfBirth) payload.dateOfBirth = data.dateOfBirth;
    if (data.gender) payload.gender = data.gender;

    if (data.address && Object.values(data.address).some(Boolean)) {
      payload.address = data.address;
    }
    if (data.emergencyContact && Object.values(data.emergencyContact).some(Boolean)) {
      payload.emergencyContact = data.emergencyContact;
    }
    if (data.medicalInfo) {
      const mi = data.medicalInfo;
      const hasData =
        mi.bloodType ??
        (mi.allergies && mi.allergies.length > 0) ??
        (mi.medications && mi.medications.length > 0) ??
        (mi.conditions && mi.conditions.length > 0);
      if (hasData) payload.medicalInfo = mi;
    }

    // Pass through doctor fields if present
    const extended = data as ProfileUpdateData & {
      specialization?: string;
      licenseNumber?: string;
    };
    if (extended.specialization !== undefined) payload.specialization = extended.specialization;
    if (extended.licenseNumber !== undefined) payload.licenseNumber = extended.licenseNumber;

    const response = await api.put<ApiResponse<{ user: UserProfile }>>('/auth/profile', payload);
    return response.data.data.user;
  },

  async uploadAvatar(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        api
          .post<ApiResponse<{ avatarUrl: string }>>(
            '/auth/profile/avatar',
            { avatarBase64: base64 },
            { headers: { 'Content-Type': 'application/json' } }
          )
          .then((res) => {
            resolve(res.data.data.avatarUrl);
          })
          .catch((err: unknown) => {
            reject(err instanceof Error ? err : new Error(String(err)));
          });
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  },

  async getSettings(): Promise<UserSettings> {
    try {
      const response = await api.get<ApiResponse<{ settings: UserSettings }>>('/auth/settings');
      const s = response.data.data.settings;
      return {
        ...s,
        appointmentReminders: {
          ...defaultAppointmentReminders,
          ...s.appointmentReminders,
          reminderTimes:
            s.appointmentReminders.reminderTimes ?? defaultAppointmentReminders.reminderTimes,
          methods: s.appointmentReminders.methods ?? defaultAppointmentReminders.methods,
        },
      };
    } catch {
      return {
        id: 'default-settings',
        userId: '',
        notifications: defaultNotificationPreferences,
        appointmentReminders: defaultAppointmentReminders,
        accessibility: defaultAccessibilitySettings,
        privacy: {
          profileVisibility: 'private',
          shareDataForResearch: false,
          allowMarketing: false,
        },
        updatedAt: new Date().toISOString(),
      };
    }
  },

  async updateSettings(data: SettingsUpdateData): Promise<UserSettings> {
    const response = await api.put<ApiResponse<{ settings: UserSettings }>>('/auth/settings', data);
    return response.data.data.settings;
  },

  async deleteAccount(password: string): Promise<void> {
    await api.delete('/auth/account', { data: { password } });
  },
};
