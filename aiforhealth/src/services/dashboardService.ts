import type { Appointment, Medication, HealthReminder, HealthMetric } from '@/types/dashboard';

// Mock data for patient dashboard
const mockAppointments: Appointment[] = [
  {
    id: '1',
    doctorName: 'Dr. Sarah Wilson',
    doctorSpecialty: 'Cardiology',
    date: '2024-01-15',
    time: '10:00 AM',
    type: 'consultation',
    status: 'scheduled',
    location: 'Medical Center - Room 205',
    notes: 'Annual heart checkup',
    doctorAvatar: '/avatars/dr-wilson.jpg'
  },
  {
    id: '2',
    doctorName: 'Dr. Michael Chen',
    doctorSpecialty: 'Neurology',
    date: '2024-01-18',
    time: '2:30 PM',
    type: 'follow-up',
    status: 'scheduled',
    location: 'Neurology Clinic - Room 102',
    notes: 'Follow-up on migraine treatment'
  },
  {
    id: '3',
    doctorName: 'Dr. Emily Rodriguez',
    doctorSpecialty: 'General Practice',
    date: '2024-01-22',
    time: '9:15 AM',
    type: 'check-up',
    status: 'scheduled',
    location: 'Main Clinic - Room 301',
    notes: 'Routine physical examination'
  }
];

const mockPastAppointments: Appointment[] = [
  {
    id: '4',
    doctorName: 'Dr. Sarah Wilson',
    doctorSpecialty: 'Cardiology',
    date: '2023-12-15',
    time: '10:00 AM',
    type: 'consultation',
    status: 'completed',
    location: 'Medical Center - Room 205',
    notes: 'EKG results normal, continue current medication'
  },
  {
    id: '5',
    doctorName: 'Dr. James Park',
    doctorSpecialty: 'Dermatology',
    date: '2023-11-28',
    time: '3:00 PM',
    type: 'consultation',
    status: 'completed',
    location: 'Dermatology Clinic - Room 150',
    notes: 'Skin examination completed, no concerns'
  }
];

const mockMedications: Medication[] = [
  {
    id: '1',
    name: 'Lisinopril',
    dosage: '10mg',
    frequency: 'Once daily',
    nextDose: '2024-01-15T08:00:00',
    remainingDoses: 25,
    totalDoses: 30,
    prescribedBy: 'Dr. Sarah Wilson',
    instructions: 'Take with food in the morning',
    sideEffects: ['Dizziness', 'Dry cough']
  },
  {
    id: '2',
    name: 'Metformin',
    dosage: '500mg',
    frequency: 'Twice daily',
    nextDose: '2024-01-15T12:00:00',
    remainingDoses: 18,
    totalDoses: 60,
    prescribedBy: 'Dr. Emily Rodriguez',
    instructions: 'Take with meals',
    sideEffects: ['Nausea', 'Stomach upset']
  },
  {
    id: '3',
    name: 'Vitamin D3',
    dosage: '1000 IU',
    frequency: 'Once daily',
    nextDose: '2024-01-15T20:00:00',
    remainingDoses: 45,
    totalDoses: 90,
    prescribedBy: 'Dr. Emily Rodriguez',
    instructions: 'Take with dinner'
  }
];

const mockHealthReminders: HealthReminder[] = [
  {
    id: '1',
    title: 'Take Blood Pressure Medication',
    description: 'Time for your daily Lisinopril dose',
    type: 'medication',
    priority: 'high',
    dueDate: '2024-01-15T08:00:00',
    completed: false,
    aiGenerated: true
  },
  {
    id: '2',
    title: 'Schedule Annual Eye Exam',
    description: 'It\'s been over a year since your last eye examination',
    type: 'checkup',
    priority: 'medium',
    dueDate: '2024-01-20T00:00:00',
    completed: false,
    aiGenerated: true
  },
  {
    id: '3',
    title: 'Daily Exercise Reminder',
    description: 'Aim for 30 minutes of moderate exercise today',
    type: 'exercise',
    priority: 'medium',
    dueDate: '2024-01-15T18:00:00',
    completed: false,
    aiGenerated: true
  },
  {
    id: '4',
    title: 'Hydration Check',
    description: 'Remember to drink at least 8 glasses of water today',
    type: 'diet',
    priority: 'low',
    dueDate: '2024-01-15T15:00:00',
    completed: true,
    aiGenerated: true
  }
];

const mockHealthMetrics: HealthMetric[] = [
  {
    id: '1',
    name: 'Blood Pressure',
    value: 125,
    unit: 'mmHg',
    date: '2024-01-14',
    status: 'normal',
    trend: 'stable'
  },
  {
    id: '2',
    name: 'Heart Rate',
    value: 72,
    unit: 'bpm',
    date: '2024-01-14',
    status: 'normal',
    trend: 'down'
  },
  {
    id: '3',
    name: 'Weight',
    value: 165,
    unit: 'lbs',
    date: '2024-01-14',
    status: 'normal',
    trend: 'down'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const dashboardService = {
  async getUpcomingAppointments(): Promise<Appointment[]> {
    await delay(500);
    return mockAppointments.filter(apt => new Date(apt.date) >= new Date());
  },

  async getAppointmentHistory(): Promise<Appointment[]> {
    await delay(500);
    return [...mockPastAppointments, ...mockAppointments.filter(apt => apt.status === 'completed')];
  },

  async getMedications(): Promise<Medication[]> {
    await delay(300);
    return mockMedications;
  },

  async getHealthReminders(): Promise<HealthReminder[]> {
    await delay(400);
    return mockHealthReminders;
  },

  async getHealthMetrics(): Promise<HealthMetric[]> {
    await delay(300);
    return mockHealthMetrics;
  },

  async markReminderComplete(reminderId: string): Promise<void> {
    await delay(200);
    const reminder = mockHealthReminders.find(r => r.id === reminderId);
    if (reminder) {
      reminder.completed = true;
    }
  },

  async rescheduleAppointment(appointmentId: string, newDate: string, newTime: string): Promise<void> {
    await delay(800);
    const appointment = mockAppointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      appointment.date = newDate;
      appointment.time = newTime;
      appointment.status = 'rescheduled';
    }
  }
};