import { config } from '@/config/env';
import type { User, Appointment, Doctor, Notification } from '@/types';

// Mock data
const mockUsers: User[] = [
  { id: '1', email: 'patient@example.com', name: 'John Doe', role: 'patient' },
  { id: '2', email: 'doctor@example.com', name: 'Dr. Sarah Wilson', role: 'doctor' },
  { id: '3', email: 'admin@example.com', name: 'Admin User', role: 'admin' },
];

const mockDoctors: Doctor[] = [
  {
    id: '2',
    name: 'Dr. Sarah Wilson',
    specialty: 'Cardiology',
    experience: 10,
    rating: 4.8,
    availability: ['09:00', '10:00', '11:00', '14:00', '15:00'],
  },
  {
    id: '4',
    name: 'Dr. Michael Chen',
    specialty: 'Neurology',
    experience: 8,
    rating: 4.9,
    availability: ['08:00', '09:00', '13:00', '14:00', '16:00'],
  },
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '2',
    date: '2024-01-15',
    time: '10:00',
    status: 'scheduled',
    type: 'consultation',
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  // Auth
  async login(email: string, password: string): Promise<User> {
    await delay(1000);
    const user = mockUsers.find(u => u.email === email);
    if (!user) throw new Error('Invalid credentials');
    return user;
  },

  async register(userData: Omit<User, 'id'>): Promise<User> {
    await delay(1000);
    const newUser = { ...userData, id: Date.now().toString() };
    mockUsers.push(newUser);
    return newUser;
  },

  // Appointments
  async getAppointments(userId: string): Promise<Appointment[]> {
    await delay(500);
    return mockAppointments.filter(apt => 
      apt.patientId === userId || apt.doctorId === userId
    );
  },

  async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
    await delay(1000);
    const newAppointment = { ...appointment, id: Date.now().toString() };
    mockAppointments.push(newAppointment);
    return newAppointment;
  },

  // Doctors
  async getDoctors(): Promise<Doctor[]> {
    await delay(500);
    return mockDoctors;
  },

  async getDoctor(id: string): Promise<Doctor | null> {
    await delay(300);
    return mockDoctors.find(doc => doc.id === id) || null;
  },

  // AI Chat (mock responses)
  async sendChatMessage(message: string): Promise<string> {
    await delay(1500);
    
    // Simple mock AI responses
    const responses = [
      "I understand your concern. Based on what you've described, I'd recommend scheduling an appointment with a healthcare professional for a proper evaluation.",
      "Thank you for sharing that information. While I can provide general health information, it's important to consult with a doctor for personalized medical advice.",
      "I'm here to help with general health questions. For specific symptoms or concerns, please consider booking an appointment with one of our qualified doctors.",
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  },
};