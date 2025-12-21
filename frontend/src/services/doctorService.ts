import type { Patient, DoctorAppointment, AppointmentRequest, PatientSummary } from '@/types/doctor';

// Mock data for doctor dashboard
const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+1234567890',
    dateOfBirth: '1985-03-15',
    gender: 'male',
    bloodType: 'O+',
    allergies: ['Penicillin', 'Shellfish'],
    emergencyContact: {
      name: 'Jane Doe',
      phone: '+1234567891',
      relationship: 'Spouse'
    },
    insuranceProvider: 'Blue Cross Blue Shield',
    lastVisit: '2023-12-15',
    nextAppointment: '2024-01-15',
    medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
    currentMedications: ['Lisinopril 10mg', 'Metformin 500mg'],
    vitalSigns: {
      bloodPressure: '125/80',
      heartRate: 72,
      temperature: 98.6,
      weight: 180,
      height: 70
    }
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '+1234567892',
    dateOfBirth: '1990-07-22',
    gender: 'female',
    bloodType: 'A-',
    allergies: ['Latex'],
    emergencyContact: {
      name: 'Mike Johnson',
      phone: '+1234567893',
      relationship: 'Brother'
    },
    insuranceProvider: 'Aetna',
    lastVisit: '2024-01-10',
    medicalHistory: ['Asthma', 'Seasonal Allergies'],
    currentMedications: ['Albuterol Inhaler', 'Claritin 10mg'],
    vitalSigns: {
      bloodPressure: '110/70',
      heartRate: 68,
      temperature: 98.4,
      weight: 135,
      height: 65
    }
  },
  {
    id: '3',
    name: 'Michael Chen',
    email: 'michael.chen@email.com',
    phone: '+1234567894',
    dateOfBirth: '1978-11-08',
    gender: 'male',
    bloodType: 'B+',
    allergies: [],
    emergencyContact: {
      name: 'Lisa Chen',
      phone: '+1234567895',
      relationship: 'Wife'
    },
    insuranceProvider: 'Kaiser Permanente',
    lastVisit: '2024-01-12',
    medicalHistory: ['High Cholesterol'],
    currentMedications: ['Atorvastatin 20mg'],
    vitalSigns: {
      bloodPressure: '130/85',
      heartRate: 75,
      temperature: 98.7,
      weight: 195,
      height: 72
    }
  }
];

const mockTodayAppointments: DoctorAppointment[] = [
  {
    id: '1',
    patientId: '1',
    patientName: 'John Doe',
    date: '2024-01-15',
    time: '09:00',
    duration: 30,
    type: 'follow-up',
    status: 'scheduled',
    reason: 'Diabetes follow-up and medication review',
    priority: 'medium',
    location: 'Room 205',
    isVirtual: false,
    notes: 'Patient reports improved blood sugar levels'
  },
  {
    id: '2',
    patientId: '2',
    patientName: 'Sarah Johnson',
    date: '2024-01-15',
    time: '10:30',
    duration: 45,
    type: 'consultation',
    status: 'scheduled',
    reason: 'Persistent cough and breathing difficulties',
    priority: 'high',
    location: 'Room 205',
    isVirtual: false,
    notes: 'May need chest X-ray'
  },
  {
    id: '3',
    patientId: '3',
    patientName: 'Michael Chen',
    date: '2024-01-15',
    time: '14:00',
    duration: 30,
    type: 'check-up',
    status: 'scheduled',
    reason: 'Annual physical examination',
    priority: 'low',
    location: 'Room 205',
    isVirtual: false
  },
  {
    id: '4',
    patientId: '1',
    patientName: 'Emma Wilson',
    date: '2024-01-15',
    time: '15:30',
    duration: 60,
    type: 'consultation',
    status: 'scheduled',
    reason: 'New patient consultation - joint pain',
    priority: 'medium',
    location: 'Room 205',
    isVirtual: false
  },
  {
    id: '5',
    patientId: '2',
    patientName: 'Robert Davis',
    date: '2024-01-15',
    time: '16:30',
    duration: 30,
    type: 'follow-up',
    status: 'scheduled',
    reason: 'Post-surgery follow-up',
    priority: 'high',
    location: 'Room 205',
    isVirtual: true
  }
];

const mockAppointmentRequests: AppointmentRequest[] = [
  {
    id: '1',
    patientId: '4',
    patientName: 'Lisa Rodriguez',
    patientEmail: 'lisa.rodriguez@email.com',
    requestedDate: '2024-01-18',
    requestedTime: '10:00',
    alternativeDates: ['2024-01-19', '2024-01-22'],
    reason: 'Routine check-up and blood work review',
    urgency: 'routine',
    status: 'pending',
    submittedAt: '2024-01-14T09:30:00',
    notes: 'Flexible with timing, prefer morning appointments'
  },
  {
    id: '2',
    patientId: '5',
    patientName: 'David Kim',
    patientEmail: 'david.kim@email.com',
    requestedDate: '2024-01-16',
    requestedTime: '14:30',
    alternativeDates: ['2024-01-17'],
    reason: 'Severe headaches for the past week',
    urgency: 'urgent',
    status: 'pending',
    submittedAt: '2024-01-14T15:45:00',
    notes: 'Headaches are getting worse, affecting work'
  },
  {
    id: '3',
    patientId: '6',
    patientName: 'Maria Garcia',
    patientEmail: 'maria.garcia@email.com',
    requestedDate: '2024-01-20',
    requestedTime: '11:00',
    alternativeDates: ['2024-01-21', '2024-01-23'],
    reason: 'Medication adjustment consultation',
    urgency: 'routine',
    status: 'approved',
    submittedAt: '2024-01-13T11:20:00'
  }
];

const mockPatientSummaries: PatientSummary[] = [
  {
    patientId: '1',
    patientName: 'John Doe',
    lastVisit: '2023-12-15',
    upcomingAppointment: '2024-01-15',
    riskLevel: 'medium',
    aiInsights: [
      'Blood glucose levels have improved by 15% since last visit',
      'Patient shows good medication compliance (92%)',
      'Weight loss of 8 lbs indicates positive lifestyle changes'
    ],
    recentSymptoms: ['Occasional dizziness', 'Mild fatigue'],
    medicationCompliance: 92,
    vitalTrends: {
      bloodPressure: 'improving',
      weight: 'improving',
      overall: 'improving'
    },
    recommendedActions: [
      'Continue current diabetes medication',
      'Schedule HbA1c test in 3 months',
      'Recommend nutritionist consultation'
    ]
  },
  {
    patientId: '2',
    patientName: 'Sarah Johnson',
    lastVisit: '2024-01-10',
    riskLevel: 'high',
    aiInsights: [
      'Asthma symptoms have worsened in the past month',
      'Peak flow readings below normal range',
      'Possible environmental trigger identified'
    ],
    recentSymptoms: ['Persistent cough', 'Shortness of breath', 'Chest tightness'],
    medicationCompliance: 78,
    vitalTrends: {
      bloodPressure: 'stable',
      weight: 'stable',
      overall: 'concerning'
    },
    recommendedActions: [
      'Consider increasing inhaler dosage',
      'Order chest X-ray',
      'Refer to pulmonologist if symptoms persist'
    ]
  },
  {
    patientId: '3',
    patientName: 'Michael Chen',
    lastVisit: '2024-01-12',
    riskLevel: 'low',
    aiInsights: [
      'Cholesterol levels within target range',
      'Exercise routine showing positive impact',
      'Dietary changes have been effective'
    ],
    recentSymptoms: [],
    medicationCompliance: 95,
    vitalTrends: {
      bloodPressure: 'stable',
      weight: 'improving',
      overall: 'improving'
    },
    recommendedActions: [
      'Continue current statin therapy',
      'Annual lipid panel in 6 months',
      'Maintain current exercise routine'
    ]
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const doctorService = {
  async getTodayAppointments(): Promise<DoctorAppointment[]> {
    await delay(500);
    return mockTodayAppointments;
  },

  async getPatients(): Promise<Patient[]> {
    await delay(400);
    return mockPatients;
  },

  async getPatient(patientId: string): Promise<Patient | null> {
    await delay(300);
    return mockPatients.find(p => p.id === patientId) || null;
  },

  async getAppointmentRequests(): Promise<AppointmentRequest[]> {
    await delay(600);
    return mockAppointmentRequests;
  },

  async getPatientSummaries(): Promise<PatientSummary[]> {
    await delay(700);
    return mockPatientSummaries;
  },

  async updateAppointmentStatus(appointmentId: string, status: DoctorAppointment['status']): Promise<void> {
    await delay(300);
    const appointment = mockTodayAppointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      appointment.status = status;
    }
  },

  async approveAppointmentRequest(requestId: string): Promise<void> {
    await delay(400);
    const request = mockAppointmentRequests.find(req => req.id === requestId);
    if (request) {
      request.status = 'approved';
    }
  },

  async rejectAppointmentRequest(requestId: string): Promise<void> {
    await delay(400);
    const request = mockAppointmentRequests.find(req => req.id === requestId);
    if (request) {
      request.status = 'rejected';
    }
  }
};