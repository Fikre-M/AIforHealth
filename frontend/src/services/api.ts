import type { User, Appointment, Doctor, Notification } from '@/types';

// Enhanced mock data with more realistic healthcare scenarios
const mockUsers: User[] = [
  { 
    id: '1', 
    email: 'patient@example.com', 
    name: 'John Doe', 
    role: 'patient',
    phone: '+1234567890',
    verified: true,
    createdAt: new Date('2024-01-01').toISOString()
  },
  { 
    id: '2', 
    email: 'doctor@example.com', 
    name: 'Dr. Sarah Wilson', 
    role: 'doctor',
    phone: '+1234567891',
    specialization: 'Cardiology',
    licenseNumber: 'MD12345',
    verified: true,
    createdAt: new Date('2023-06-15').toISOString()
  },
  { 
    id: '3', 
    email: 'admin@example.com', 
    name: 'Admin User', 
    role: 'admin',
    verified: true,
    createdAt: new Date('2023-01-01').toISOString()
  },
  {
    id: '4',
    email: 'patient2@example.com',
    name: 'Jane Smith',
    role: 'patient',
    phone: '+1234567892',
    verified: true,
    createdAt: new Date('2024-02-15').toISOString()
  },
  {
    id: '5',
    email: 'doctor2@example.com',
    name: 'Dr. Michael Chen',
    role: 'doctor',
    phone: '+1234567893',
    specialization: 'Neurology',
    licenseNumber: 'MD67890',
    verified: true,
    createdAt: new Date('2023-08-20').toISOString()
  }
];

const mockDoctors: Doctor[] = [
  {
    id: '2',
    name: 'Dr. Sarah Wilson',
    specialty: 'Cardiology',
    experience: 10,
    rating: 4.8,
    availability: ['09:00', '10:00', '11:00', '14:00', '15:00'],
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '5',
    name: 'Dr. Michael Chen',
    specialty: 'Neurology',
    experience: 8,
    rating: 4.9,
    availability: ['08:00', '09:00', '13:00', '14:00', '16:00'],
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '6',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Dermatology',
    experience: 12,
    rating: 4.7,
    availability: ['10:00', '11:00', '12:00', '15:00', '16:00'],
    avatar: 'https://images.unsplash.com/photo-1594824475317-8b7b0c8b8b8b?w=150&h=150&fit=crop&crop=face'
  },
  {
    id: '7',
    name: 'Dr. James Thompson',
    specialty: 'Orthopedics',
    experience: 15,
    rating: 4.6,
    availability: ['08:00', '09:00', '10:00', '13:00', '14:00'],
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face'
  }
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
    notes: 'Regular checkup for heart condition'
  },
  {
    id: '2',
    patientId: '4',
    doctorId: '5',
    date: '2024-01-16',
    time: '14:00',
    status: 'scheduled',
    type: 'follow-up',
    notes: 'Follow-up for migraine treatment'
  },
  {
    id: '3',
    patientId: '1',
    doctorId: '2',
    date: '2024-01-10',
    time: '09:00',
    status: 'completed',
    type: 'consultation',
    notes: 'Blood pressure monitoring'
  }
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Appointment Reminder',
    message: 'Your appointment with Dr. Sarah Wilson is tomorrow at 10:00 AM',
    type: 'info',
    read: false,
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
  },
  {
    id: '2',
    title: 'Lab Results Available',
    message: 'Your recent blood test results are now available in your portal',
    type: 'success',
    read: false,
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  },
  {
    id: '3',
    title: 'Prescription Refill',
    message: 'Your prescription for Lisinopril is ready for pickup',
    type: 'info',
    read: true,
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  }
];

// Simulate network conditions and API delays
const getRandomDelay = (min: number = 300, max: number = 1500): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const simulateNetworkError = (errorRate: number = 0.05): void => {
  if (Math.random() < errorRate) {
    throw new Error('Network error: Please check your connection and try again');
  }
};

// Enhanced API client with comprehensive error handling and realistic responses
export const api = {
  // Authentication endpoints
  auth: {
    async login(email: string, password: string): Promise<User> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(800, 1200)));
      simulateNetworkError();
      
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // Mock password validation (in production, use proper hashing)
      if (password !== 'password') {
        throw new Error('Invalid email or password');
      }
      
      return user;
    },

    async register(userData: Omit<User, 'id' | 'createdAt' | 'verified'>): Promise<User> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(1000, 2000)));
      simulateNetworkError();
      
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === userData.email);
      if (existingUser) {
        throw new Error('Email already registered');
      }
      
      const newUser: User = {
        ...userData,
        id: Date.now().toString(),
        verified: false,
        createdAt: new Date().toISOString()
      };
      
      mockUsers.push(newUser);
      return newUser;
    },

    async logout(): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(200, 500)));
      // In production, would invalidate tokens on server
      return;
    },

    async refreshToken(token: string): Promise<{ token: string; refreshToken: string }> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(300, 600)));
      simulateNetworkError();
      
      // Mock token refresh logic
      return {
        token: `new-access-token-${Date.now()}`,
        refreshToken: `new-refresh-token-${Date.now()}`
      };
    }
  },

  // User management endpoints
  users: {
    async getProfile(userId: string): Promise<User | null> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(200, 500)));
      simulateNetworkError();
      
      return mockUsers.find(u => u.id === userId) || null;
    },

    async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(500, 1000)));
      simulateNetworkError();
      
      const userIndex = mockUsers.findIndex(u => u.id === userId);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      
      mockUsers[userIndex] = { ...mockUsers[userIndex], ...updates };
      return mockUsers[userIndex];
    },

    async getAllUsers(): Promise<User[]> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(400, 800)));
      simulateNetworkError();
      
      return mockUsers;
    }
  },

  // Appointment management endpoints
  appointments: {
    async getAppointments(userId: string, role: 'patient' | 'doctor' = 'patient'): Promise<Appointment[]> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(300, 700)));
      simulateNetworkError();
      
      if (role === 'patient') {
        return mockAppointments.filter(apt => apt.patientId === userId);
      } else {
        return mockAppointments.filter(apt => apt.doctorId === userId);
      }
    },

    async getAppointment(appointmentId: string): Promise<Appointment | null> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(200, 400)));
      simulateNetworkError();
      
      return mockAppointments.find(apt => apt.id === appointmentId) || null;
    },

    async createAppointment(appointment: Omit<Appointment, 'id'>): Promise<Appointment> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(800, 1500)));
      simulateNetworkError();
      
      // Validate appointment slot availability
      const conflictingAppointment = mockAppointments.find(apt => 
        apt.doctorId === appointment.doctorId && 
        apt.date === appointment.date && 
        apt.time === appointment.time &&
        apt.status !== 'cancelled'
      );
      
      if (conflictingAppointment) {
        throw new Error('This time slot is no longer available');
      }
      
      const newAppointment: Appointment = {
        ...appointment,
        id: Date.now().toString()
      };
      
      mockAppointments.push(newAppointment);
      return newAppointment;
    },

    async updateAppointment(appointmentId: string, updates: Partial<Appointment>): Promise<Appointment> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(500, 1000)));
      simulateNetworkError();
      
      const appointmentIndex = mockAppointments.findIndex(apt => apt.id === appointmentId);
      if (appointmentIndex === -1) {
        throw new Error('Appointment not found');
      }
      
      mockAppointments[appointmentIndex] = { ...mockAppointments[appointmentIndex], ...updates };
      return mockAppointments[appointmentIndex];
    },

    async cancelAppointment(appointmentId: string): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(400, 800)));
      simulateNetworkError();
      
      const appointmentIndex = mockAppointments.findIndex(apt => apt.id === appointmentId);
      if (appointmentIndex === -1) {
        throw new Error('Appointment not found');
      }
      
      mockAppointments[appointmentIndex].status = 'cancelled';
    }
  },

  // Doctor management endpoints
  doctors: {
    async getDoctors(specialty?: string): Promise<Doctor[]> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(300, 600)));
      simulateNetworkError();
      
      if (specialty) {
        return mockDoctors.filter(doc => 
          doc.specialty.toLowerCase().includes(specialty.toLowerCase())
        );
      }
      
      return mockDoctors;
    },

    async getDoctor(doctorId: string): Promise<Doctor | null> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(200, 400)));
      simulateNetworkError();
      
      return mockDoctors.find(doc => doc.id === doctorId) || null;
    },

    async getDoctorAvailability(doctorId: string, date: string): Promise<string[]> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(300, 600)));
      simulateNetworkError();
      
      const doctor = mockDoctors.find(doc => doc.id === doctorId);
      if (!doctor) {
        throw new Error('Doctor not found');
      }
      
      // Filter out booked slots
      const bookedSlots = mockAppointments
        .filter(apt => apt.doctorId === doctorId && apt.date === date && apt.status !== 'cancelled')
        .map(apt => apt.time);
      
      return doctor.availability.filter(slot => !bookedSlots.includes(slot));
    }
  },

  // Notification endpoints
  notifications: {
    async getNotifications(userId: string): Promise<Notification[]> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(200, 500)));
      simulateNetworkError();
      
      // In a real app, notifications would be user-specific
      return mockNotifications;
    },

    async getUnreadNotifications(userId: string): Promise<Notification[]> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(200, 400)));
      simulateNetworkError();
      
      return mockNotifications.filter(notif => !notif.read);
    },

    async markAsRead(notificationId: string): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(200, 400)));
      simulateNetworkError();
      
      const notification = mockNotifications.find(notif => notif.id === notificationId);
      if (notification) {
        notification.read = true;
      }
    },

    async markAllAsRead(userId: string): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(300, 600)));
      simulateNetworkError();
      
      mockNotifications.forEach(notif => {
        notif.read = true;
      });
    },

    async createNotification(notification: Omit<Notification, 'id' | 'timestamp'>): Promise<Notification> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(300, 600)));
      simulateNetworkError();
      
      const newNotification: Notification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date().toISOString()
      };
      
      mockNotifications.unshift(newNotification);
      return newNotification;
    }
  },

  // AI Assistant endpoints
  ai: {
    async sendMessage(message: string, conversationId?: string): Promise<{
      response: string;
      conversationId: string;
      suggestions?: string[];
    }> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(1000, 3000)));
      simulateNetworkError();
      
      // Enhanced AI response logic based on message content
      const lowerMessage = message.toLowerCase();
      let response: string;
      let suggestions: string[] = [];
      
      if (lowerMessage.includes('pain') || lowerMessage.includes('hurt')) {
        response = "I understand you're experiencing pain. Can you describe the location, intensity (1-10), and when it started? For severe or persistent pain, I recommend scheduling an appointment with a healthcare provider.";
        suggestions = [
          "The pain is in my chest",
          "It's a headache that won't go away",
          "My back has been hurting for days"
        ];
      } else if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
        response = "Fever can be a sign of infection or illness. Have you taken your temperature? If it's over 101°F (38.3°C) or you have other concerning symptoms, please consider seeking medical attention.";
        suggestions = [
          "My temperature is 102°F",
          "I also have chills and body aches",
          "The fever started yesterday"
        ];
      } else if (lowerMessage.includes('appointment') || lowerMessage.includes('book') || lowerMessage.includes('schedule')) {
        response = "I can help you understand the appointment booking process. You can schedule appointments through our booking system. Would you like me to guide you through the available doctors and specialties?";
        suggestions = [
          "Show me available cardiologists",
          "I need a general checkup",
          "What's the earliest available appointment?"
        ];
      } else if (lowerMessage.includes('medication') || lowerMessage.includes('prescription')) {
        response = "For medication questions, it's important to consult with your healthcare provider or pharmacist. They can provide specific guidance about dosages, interactions, and side effects based on your medical history.";
        suggestions = [
          "I'm having side effects from my medication",
          "Can I take this with my other prescriptions?",
          "I forgot to take my medication"
        ];
      } else if (lowerMessage.includes('emergency') || lowerMessage.includes('urgent')) {
        response = "If this is a medical emergency, please call 911 immediately or go to your nearest emergency room. For urgent but non-emergency situations, consider visiting an urgent care center or contacting your doctor's after-hours line.";
        suggestions = [
          "Call 911",
          "Find nearest urgent care",
          "Contact my doctor"
        ];
      } else {
        const generalResponses = [
          "Thank you for your question. While I can provide general health information, it's always best to consult with a qualified healthcare professional for personalized medical advice.",
          "I'm here to help with general health questions and guide you through our services. For specific medical concerns, I recommend speaking with one of our healthcare providers.",
          "I understand your concern. For the most accurate and personalized advice, please consider scheduling a consultation with one of our qualified doctors.",
          "That's a great question. While I can offer general guidance, a healthcare professional would be better positioned to provide specific recommendations based on your individual situation."
        ];
        
        response = generalResponses[Math.floor(Math.random() * generalResponses.length)];
        suggestions = [
          "Book an appointment with a doctor",
          "Learn more about symptoms",
          "Find a specialist"
        ];
      }
      
      return {
        response,
        conversationId: conversationId || `conv-${Date.now()}`,
        suggestions
      };
    },

    async getConversationHistory(conversationId: string): Promise<Array<{
      message: string;
      response: string;
      timestamp: string;
    }>> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(300, 600)));
      simulateNetworkError();
      
      // Mock conversation history
      return [
        {
          message: "I have been having headaches lately",
          response: "I understand you're experiencing headaches. Can you tell me more about when they occur and how severe they are?",
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
      ];
    }
  },

  // Health data endpoints
  health: {
    async getVitalSigns(userId: string): Promise<{
      bloodPressure?: { systolic: number; diastolic: number; date: string };
      heartRate?: { bpm: number; date: string };
      temperature?: { fahrenheit: number; date: string };
      weight?: { pounds: number; date: string };
    }> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(300, 600)));
      simulateNetworkError();
      
      // Mock vital signs data
      return {
        bloodPressure: { systolic: 120, diastolic: 80, date: new Date().toISOString() },
        heartRate: { bpm: 72, date: new Date().toISOString() },
        temperature: { fahrenheit: 98.6, date: new Date().toISOString() },
        weight: { pounds: 165, date: new Date().toISOString() }
      };
    },

    async recordVitalSigns(userId: string, vitals: any): Promise<void> {
      await new Promise(resolve => setTimeout(resolve, getRandomDelay(500, 1000)));
      simulateNetworkError();
      
      // In production, would store vital signs data
      console.log('Vital signs recorded:', vitals);
    }
  }
};