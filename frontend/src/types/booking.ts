export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  rating: number;
  specialties: string[];
  image?: string;
  distance?: number;
  isOpen: boolean;
  openingHours: {
    [key: string]: { open: string; close: string } | null;
  };
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinicId: string;
  clinicName?: string; // Add clinicName property
  rating: number;
  experience: number;
  education: string[];
  languages: string[];
  avatar?: string;
  consultationFee: number;
  nextAvailable: string;
  isAvailable: boolean;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  type: 'regular' | 'urgent' | 'emergency';
  duration: number;
}

export interface DayAvailability {
  date: string;
  dayOfWeek: string;
  isAvailable: boolean;
  slots: TimeSlot[];
}

export interface BookingFormData {
  clinicId: string;
  doctorId: string;
  date: string;
  time: string;
  appointmentType: 'consultation' | 'follow_up' | 'routine_checkup' | 'emergency';
  reason: string;
  notes?: string;
  urgency: 'routine' | 'urgent' | 'emergency';
  preferredLanguage?: string;
}

export interface AISuggestion {
  type: 'best-time' | 'urgency' | 'doctor-recommendation' | 'clinic-recommendation';
  title: string;
  description: string;
  confidence: number;
  action?: {
    label: string;
    data: any;
  };
}

export interface BookingConfirmation {
  appointmentId: string;
  patientName: string;
  doctorName: string;
  clinicName: string;
  date: string;
  time: string;
  appointmentType: string;
  reason: string;
  estimatedDuration: number;
  consultationFee: number;
  confirmationCode: string;
  instructions: string[];
}