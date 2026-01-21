// Mock API service for development
import type { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  User 
} from '@/types/auth';
import type { Appointment } from '@/types';
import type { Notification } from '@/types/notification';
import { addDays, format } from 'date-fns';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let mockUsers: User[] = [
  {
    id: '1',
    email: 'patient@example.com',
    name: 'John Doe',
    role: 'patient',
    verified: true,
    createdAt: '2024-01-01T00:00:00Z',
    avatar: '/avatars/patient.jpg',
    phone: '+1 (555) 123-4567'
  },
  {
    id: '2',
    email: 'doctor@example.com',
    name: 'Dr. Sarah Wilson',
    role: 'doctor',
    verified: true,
    createdAt: '2024-01-01T00:00:00Z',
    avatar: '/avatars/doctor.jpg',
    phone: '+1 (555) 987-6543',
    specialization: 'Cardiology',
    licenseNumber: 'MD123456'
  }
];

let mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '2',
    date: addDays(new Date(), 1).toISOString().split('T')[0],
    time: '10:00',
    status: 'scheduled',
    type: 'consultation',
    notes: 'Regular checkup for heart condition'
  },
  {
    id: '2',
    patientId: '1',
    doctorId: '2',
    date: addDays(new Date(), 7).toISOString().split('T')[0],
    time: '14:00',
    status: 'scheduled',
    type: 'follow-up',
    notes: 'Follow-up appointment'
  }
];

let mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'appointment',
    title: 'Upcoming Appointment',
    message: 'You have an appointment with Dr. Sarah Wilson tomorrow at 10:00 AM',
    timestamp: new Date().toISOString(),
    read: false,
    priority: 'medium',
    actionUrl: '/appointments/1'
  },
  {
    id: '2',
    userId: '1',
    type: 'reminder',
    title: 'Medication Reminder',
    message: 'Time to take your morning medication',
    timestamp: addDays(new Date(), -1).toISOString(),
    read: true,
    priority: 'high'
  }
];

// Current user session
let currentUser: User | null = null;
let accessToken: string | null = null;

export const mockApi = {
  // Auth endpoints
  auth: {
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
      await delay();
      
      const user = mockUsers.find(u => u.email === credentials.email);
      if (!user || credentials.password !== 'password123') {
        throw new Error('Invalid email or password');
      }

      currentUser = user;
      accessToken = 'mock-access-token-' + Date.now();
      
      return {
        user,
        token: accessToken,
        refreshToken: 'mock-refresh-token-' + Date.now()
      };
    },

    async register(data: RegisterData): Promise<AuthResponse> {
      await delay();
      
      if (mockUsers.find(u => u.email === data.email)) {
        throw new Error('User already exists');
      }

      const newUser: User = {
        id: String(mockUsers.length + 1),
        email: data.email,
        name: data.name,
        role: data.role,
        verified: false,
        createdAt: new Date().toISOString(),
        phone: data.phone,
        specialization: data.specialization,
        licenseNumber: data.licenseNumber
      };

      mockUsers.push(newUser);
      currentUser = newUser;
      accessToken = 'mock-access-token-' + Date.now();

      return {
        user: newUser,
        token: accessToken,
        refreshToken: 'mock-refresh-token-' + Date.now()
      };
    },

    async logout(): Promise<void> {
      await delay();
      currentUser = null;
      accessToken = null;
    },

    async refreshToken(): Promise<{ tokens: { accessToken: string; refreshToken: string } }> {
      await delay();
      return {
        tokens: {
          accessToken: 'mock-access-token-' + Date.now(),
          refreshToken: 'mock-refresh-token-' + Date.now()
        }
      };
    },

    async getProfile(): Promise<User> {
      await delay();
      if (!currentUser) throw new Error('Not authenticated');
      return currentUser;
    },

    async updateProfile(data: Partial<User>): Promise<User> {
      await delay();
      if (!currentUser) throw new Error('Not authenticated');
      
      currentUser = { ...currentUser, ...data };
      const userIndex = mockUsers.findIndex(u => u.id === currentUser!.id);
      if (userIndex >= 0) {
        mockUsers[userIndex] = currentUser;
      }
      
      return currentUser;
    }
  },

  // Appointment endpoints
  appointments: {
    async getAppointments(params?: any): Promise<{ appointments: Appointment[] }> {
      await delay();
      let filtered = [...mockAppointments];
      
      if (params?.status) {
        filtered = filtered.filter(apt => params.status.includes(apt.status));
      }
      
      return { appointments: filtered };
    },

    async getAppointment(id: string): Promise<{ appointment: Appointment }> {
      await delay();
      const appointment = mockAppointments.find(apt => apt.id === id);
      if (!appointment) throw new Error('Appointment not found');
      return { appointment };
    },

    async createAppointment(data: Partial<Appointment>): Promise<{ appointment: Appointment }> {
      await delay();
      const newAppointment: Appointment = {
        id: String(mockAppointments.length + 1),
        patientId: data.patientId || '1',
        doctorId: data.doctorId || '2',
        date: data.date || format(addDays(new Date(), 1), 'yyyy-MM-dd'),
        time: data.time || '10:00',
        status: 'scheduled',
        type: data.type || 'consultation',
        notes: data.notes || ''
      };
      
      mockAppointments.push(newAppointment);
      return { appointment: newAppointment };
    },

    async updateAppointment(id: string, data: Partial<Appointment>): Promise<{ appointment: Appointment }> {
      await delay();
      const index = mockAppointments.findIndex(apt => apt.id === id);
      if (index === -1) throw new Error('Appointment not found');
      
      mockAppointments[index] = { ...mockAppointments[index], ...data };
      return { appointment: mockAppointments[index] };
    },

    async cancelAppointment(id: string): Promise<{ appointment: Appointment }> {
      await delay();
      const index = mockAppointments.findIndex(apt => apt.id === id);
      if (index === -1) throw new Error('Appointment not found');
      
      mockAppointments[index].status = 'cancelled';
      return { appointment: mockAppointments[index] };
    }
  },

  // Notification endpoints
  notifications: {
    async getNotifications(): Promise<{ notifications: Notification[] }> {
      await delay();
      return { notifications: mockNotifications };
    },

    async markAsRead(id: string): Promise<{ notification: Notification }> {
      await delay();
      const notification = mockNotifications.find(n => n.id === id);
      if (!notification) throw new Error('Notification not found');
      
      notification.read = true;
      return { notification };
    },

    async markAllAsRead(): Promise<{ count: number }> {
      await delay();
      const unreadCount = mockNotifications.filter(n => !n.read).length;
      mockNotifications.forEach(n => n.read = true);
      return { count: unreadCount };
    },

    async deleteNotification(id: string): Promise<void> {
      await delay();
      const index = mockNotifications.findIndex(n => n.id === id);
      if (index === -1) throw new Error('Notification not found');
      mockNotifications.splice(index, 1);
    }
  },

  // Generic GET/POST/PUT/DELETE methods for other endpoints
  async get(url: string, params?: any): Promise<any> {
    await delay();
    console.log(`Mock API GET: ${url}`, params);
    
    // Return appropriate mock data based on URL
    if (url.includes('/health/medications')) {
      return { data: { medications: [] } };
    }
    if (url.includes('/health/reminders')) {
      return { data: { reminders: [] } };
    }
    if (url.includes('/health/metrics')) {
      return { data: { metrics: {} } };
    }
    
    return { data: {} };
  },

  async post(url: string, data?: any): Promise<any> {
    await delay();
    console.log(`Mock API POST: ${url}`, data);
    return { data: { success: true } };
  },

  async put(url: string, data?: any): Promise<any> {
    await delay();
    console.log(`Mock API PUT: ${url}`, data);
    return { data: { success: true } };
  },

  async patch(url: string, data?: any): Promise<any> {
    await delay();
    console.log(`Mock API PATCH: ${url}`, data);
    return { data: { success: true } };
  },

  async delete(url: string): Promise<any> {
    await delay();
    console.log(`Mock API DELETE: ${url}`);
    return { data: { success: true } };
  }
};