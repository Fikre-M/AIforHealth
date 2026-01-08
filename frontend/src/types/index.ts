export { AppointmentStatus } from "./appointment";
export interface User {
  id: string;
  email: string;
  name: string;
  role: "patient" | "doctor" | "admin";
  avatar?: string;
  phone?: string;
  specialization?: string; // For doctors
  licenseNumber?: string; // For doctors
  verified: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
  type: "consultation" | "follow-up" | "emergency";
  notes?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  avatar?: string;
  availability: string[];
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  timestamp: string;
}

// Re-export profile types
export type {
  UserProfile,
  UserSettings,
  ProfileUpdateData,
  SettingsUpdateData,
  NotificationPreferences,
  AppointmentReminderSettings,
  AccessibilitySettings,
} from "./profile";
