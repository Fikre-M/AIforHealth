export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  allergies: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insuranceProvider?: string;
  lastVisit?: string;
  nextAppointment?: string;
  avatar?: string;
  medicalHistory: string[];
  currentMedications: string[];
  vitalSigns?: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    weight: number;
    height: number;
  };
}

export interface DoctorAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar?: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: 'consultation' | 'follow-up' | 'check-up' | 'emergency' | 'surgery';
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location: string;
  isVirtual: boolean;
}

export interface AppointmentRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  requestedDate: string;
  requestedTime: string;
  alternativeDates: string[];
  reason: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  status: 'pending' | 'approved' | 'rejected' | 'rescheduled';
  submittedAt: string;
  notes?: string;
}

export interface PatientSummary {
  patientId: string;
  patientName: string;
  lastVisit: string;
  upcomingAppointment?: string;
  riskLevel: 'low' | 'medium' | 'high';
  aiInsights: string[];
  recentSymptoms: string[];
  medicationCompliance: number; // percentage
  vitalTrends: {
    bloodPressure: 'improving' | 'stable' | 'concerning';
    weight: 'improving' | 'stable' | 'concerning';
    overall: 'improving' | 'stable' | 'concerning';
  };
  recommendedActions: string[];
}