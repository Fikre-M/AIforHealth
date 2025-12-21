import type {
  UserProfile,
  UserSettings,
  ProfileUpdateData,
  SettingsUpdateData,
  NotificationPreferences,
  AppointmentReminderSettings,
  AccessibilitySettings
} from '@/types/profile';

// Mock data
const mockProfiles: Map<string, UserProfile> = new Map();
const mockSettings: Map<string, UserSettings> = new Map();

// Default settings
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

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const profileService = {
  /**
   * Get user profile by ID
   */
  async getProfile(userId: string): Promise<UserProfile> {
    await delay(500);

    let profile = mockProfiles.get(userId);
    
    if (!profile) {
      // Create default profile
      profile = {
        id: userId,
        email: 'user@example.com',
        name: 'User Name',
        role: 'patient',
        verified: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      mockProfiles.set(userId, profile);
    }

    return profile;
  },

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: ProfileUpdateData): Promise<UserProfile> {
    await delay(800);

    const profile = await this.getProfile(userId);
    
    const updatedProfile: UserProfile = {
      ...profile,
      ...data,
      updatedAt: new Date().toISOString()
    };

    mockProfiles.set(userId, updatedProfile);
    return updatedProfile;
  },

  /**
   * Upload profile avatar
   */
  async uploadAvatar(userId: string, file: File): Promise<string> {
    await delay(1000);

    // In production, would upload to cloud storage
    const avatarUrl = URL.createObjectURL(file);
    
    const profile = await this.getProfile(userId);
    profile.avatar = avatarUrl;
    profile.updatedAt = new Date().toISOString();
    
    mockProfiles.set(userId, profile);
    return avatarUrl;
  },

  /**
   * Get user settings
   */
  async getSettings(userId: string): Promise<UserSettings> {
    await delay(500);

    let settings = mockSettings.get(userId);
    
    if (!settings) {
      // Create default settings
      settings = {
        id: `settings-${userId}`,
        userId,
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
      mockSettings.set(userId, settings);
    }

    return settings;
  },

  /**
   * Update user settings
   */
  async updateSettings(userId: string, data: SettingsUpdateData): Promise<UserSettings> {
    await delay(800);

    const settings = await this.getSettings(userId);
    
    const updatedSettings: UserSettings = {
      ...settings,
      notifications: data.notifications 
        ? { ...settings.notifications, ...data.notifications }
        : settings.notifications,
      appointmentReminders: data.appointmentReminders
        ? { ...settings.appointmentReminders, ...data.appointmentReminders }
        : settings.appointmentReminders,
      accessibility: data.accessibility
        ? { ...settings.accessibility, ...data.accessibility }
        : settings.accessibility,
      privacy: data.privacy
        ? { ...settings.privacy, ...data.privacy }
        : settings.privacy,
      updatedAt: new Date().toISOString()
    };

    mockSettings.set(userId, updatedSettings);
    return updatedSettings;
  },

  /**
   * Delete user account
   */
  async deleteAccount(userId: string, password: string): Promise<void> {
    await delay(1000);

    // In production, would verify password and delete account
    mockProfiles.delete(userId);
    mockSettings.delete(userId);
  }
};
