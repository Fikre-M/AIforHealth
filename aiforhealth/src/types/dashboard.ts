export interface Appointment {
  id: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'check-up' | 'emergency';
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  location: string;
  notes?: string;
  doctorAvatar?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  nextDose: string;
  remainingDoses: number;
  totalDoses: number;
  prescribedBy: string;
  instructions?: string;
  sideEffects?: string[];
}

export interface HealthReminder {
  id: string;
  title: string;
  description: string;
  type: 'medication' | 'appointment' | 'exercise' | 'diet' | 'checkup';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  completed: boolean;
  aiGenerated: boolean;
}

export interface HealthMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  date: string;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}