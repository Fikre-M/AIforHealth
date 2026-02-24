import type { Appointment } from '@/types';
import { addDays } from 'date-fns';
import apiAdapter from './apiAdapter';

// Enhanced appointment types
export interface AppointmentSlot {
  id: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number; // in minutes
  available: boolean;
  type: 'regular' | 'urgent' | 'follow-up';
  price: number;
}

export interface AppointmentRequest {
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  type: 'consultation' | 'follow-up' | 'emergency';
  reason: string;
  notes?: string;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
}

export interface AppointmentFilter {
  status?: Appointment['status'][];
  type?: Appointment['type'][];
  doctorId?: string;
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AppointmentSearchParams {
  query?: string;
  status?: string;
  type?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
  offset?: number;
}

export interface AppointmentStats {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  averageDuration: number;
}

// Mock appointment data with enhanced details
const mockAppointments: Appointment[] = [
  {
    id: '1',
    patientId: '1',
    doctorId: '2',
    date: addDays(new Date(), 1).toISOString().split('T')[0],
    time: '10:00',
    status: 'scheduled',
    type: 'consultation',
    notes: 'Regular checkup for heart condition. Patient reports occasional chest discomfort.'
  },
  {
    id: '2',
    patientId: '4',
    doctorId: '5',
    date: addDays(new Date(), 2).toISOString().split('T')[0],
    time: '14:00',
    status: 'scheduled',
    type: 'follow-up',
    notes: 'Follow-up for migraine treatment. Review medication effectiveness.'
  },
  {
    id: '3',
    patientId: '1',
    doctorId: '2',
    date: addDays(new Date(), -3).toISOString().split('T')[0],
    time: '09:00',
    status: 'completed',
    type: 'consultation',
    notes: 'Blood pressure monitoring. Patient doing well on current medication.'
  },
  {
    id: '4',
    patientId: '1',
    doctorId: '5',
    date: addDays(new Date(), 5).toISOString().split('T')[0],
    time: '11:30',
    status: 'scheduled',
    type: 'consultation',
    notes: 'Annual physical examination'
  },
  {
    id: '5',
    patientId: '4',
    doctorId: '2',
    date: addDays(new Date(), -1).toISOString().split('T')[0],
    time: '15:00',
    status: 'cancelled',
    type: 'consultation',
    notes: 'Patient cancelled due to scheduling conflict'
  }
];

// Mock doctor availability
const mockDoctorSchedules = new Map<string, AppointmentSlot[]>();

// Generate mock availability for doctors
function generateDoctorAvailability(doctorId: string, startDate: Date, endDate: Date): AppointmentSlot[] {
  const slots: AppointmentSlot[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    // Skip weekends for most doctors
    if (current.getDay() !== 0 && current.getDay() !== 6) {
      // Generate slots from 9 AM to 5 PM
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const dateStr = current.toISOString().split('T')[0];
          
          // Check if slot is already booked
          const isBooked = mockAppointments.some(apt => 
            apt.doctorId === doctorId && 
            apt.date === dateStr && 
            apt.time === time &&
            apt.status !== 'cancelled'
          );
          
          slots.push({
            id: `slot-${doctorId}-${dateStr}-${time}`,
            doctorId,
            date: dateStr,
            time,
            duration: 30,
            available: !isBooked && Math.random() > 0.2, // 80% availability for unbooked slots
            type: hour < 12 ? 'regular' : hour > 15 ? 'urgent' : 'regular',
            price: hour < 12 ? 200 : hour > 15 ? 300 : 250
          });
        }
      }
    }
    current.setDate(current.getDate() + 1);
  }
  
  return slots;
}

// Simulate API delays
const delay = (ms: number) => new Promise(resolve => 
  setTimeout(resolve, ms + Math.random() * 200)
);

// Simulate network errors
const simulateNetworkError = (errorRate: number = 0.02) => {
  if (Math.random() < errorRate) {
    throw new Error('Appointment service temporarily unavailable');
  }
};

export const appointmentService = {
  /**
   * Get appointments with optional filtering
   */
  async getAppointments(filter?: AppointmentFilter): Promise<Appointment[]> {
    try {
      await delay(300);
      console.log('🔄 Fetching appointments from API...');
      const response = await apiAdapter.appointments.getAppointments(filter);
      console.log('✅ Appointments fetched successfully:', response);
      
      // Handle backend response format: response.data.appointments or response.appointments
      return response.appointments || response.data?.appointments || response;
    } catch (error) {
      console.error('❌ Failed to fetch appointments from API:', error);
      
      // Check if it's a network error
      if (error instanceof Error) {
        if (error.message.includes('Network Error') || error.message.includes('fetch')) {
          console.warn('🔄 Network error detected, using mock data as fallback');
        } else {
          console.warn('🔄 API error detected, using mock data as fallback');
        }
      }
      
      // Fallback to mock data if API fails
      console.log('📝 Using mock appointments data');
      let filtered = [...mockAppointments];
      
      if (filter?.status) {
        filtered = filtered.filter(apt => filter.status!.includes(apt.status));
      }
      
      if (filter?.type) {
        filtered = filtered.filter(apt => filter.type!.includes(apt.type));
      }
      
      if (filter?.dateFrom) {
        filtered = filtered.filter(apt => apt.date >= filter.dateFrom!);
      }
      
      if (filter?.dateTo) {
        filtered = filtered.filter(apt => apt.date <= filter.dateTo!);
      }
      
      console.log('📋 Returning filtered mock appointments:', filtered);
      return filtered;
    }
  },

  /**
   * Search appointments with enhanced filtering and pagination
   */
  async searchAppointments(params: AppointmentSearchParams): Promise<{
    appointments: Appointment[];
    total: number;
    hasMore: boolean;
  }> {
    await delay(400);
    simulateNetworkError();

    try {
      // Try API first
      const response = await apiAdapter.get('/appointments/search', { params });
      return response.data;
    } catch (error) {
      console.warn('Search API failed, using mock search:', error);
      
      // Mock search implementation
      let filtered = [...mockAppointments];
      
      if (params.query) {
        const query = params.query.toLowerCase();
        filtered = filtered.filter(apt => 
          apt.notes?.toLowerCase().includes(query) ||
          apt.type.toLowerCase().includes(query) ||
          apt.status.toLowerCase().includes(query) ||
          // Add doctor name search (would come from API in real implementation)
          'Dr. Sarah Wilson'.toLowerCase().includes(query) ||
          'Dr. Michael Chen'.toLowerCase().includes(query) ||
          'Dr. Emily Rodriguez'.toLowerCase().includes(query)
        );
      }
      
      if (params.status) {
        filtered = filtered.filter(apt => apt.status === params.status);
      }
      
      if (params.type) {
        filtered = filtered.filter(apt => apt.type === params.type);
      }
      
      if (params.dateFrom) {
        filtered = filtered.filter(apt => apt.date >= params.dateFrom!);
      }
      
      if (params.dateTo) {
        filtered = filtered.filter(apt => apt.date <= params.dateTo!);
      }
      
      // Apply pagination
      const limit = params.limit || 10;
      const offset = params.offset || 0;
      const paginatedResults = filtered.slice(offset, offset + limit);
      
      return {
        appointments: paginatedResults,
        total: filtered.length,
        hasMore: offset + limit < filtered.length
      };
    }
  },

  /**
   * Get a specific appointment by ID
   */
  async getAppointment(appointmentId: string): Promise<Appointment | null> {
    await delay(300);
    simulateNetworkError();
    
    return mockAppointments.find(apt => apt.id === appointmentId) || null;
  },

  /**
   * Get upcoming appointments for a user
   */
  async getUpcomingAppointments(userId: string, role: 'patient' | 'doctor' = 'patient'): Promise<Appointment[]> {
    await delay(400);
    simulateNetworkError();
    
    const today = new Date().toISOString().split('T')[0];
    
    return mockAppointments
      .filter(apt => {
        const matchesUser = role === 'patient' ? apt.patientId === userId : apt.doctorId === userId;
        const isFuture = apt.date >= today;
        const isActive = apt.status === 'scheduled';
        return matchesUser && isFuture && isActive;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
  },

  /**
   * Get appointment history for a user
   */
  async getAppointmentHistory(userId: string, role: 'patient' | 'doctor' = 'patient'): Promise<Appointment[]> {
    await delay(400);
    simulateNetworkError();
    
    const today = new Date().toISOString().split('T')[0];
    
    return mockAppointments
      .filter(apt => {
        const matchesUser = role === 'patient' ? apt.patientId === userId : apt.doctorId === userId;
        const isPast = apt.date < today || apt.status === 'completed' || apt.status === 'cancelled';
        return matchesUser && isPast;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });
  },

  /**
   * Create a new appointment
   */
  async createAppointment(request: AppointmentRequest): Promise<{
    appointment: Appointment;
    confirmationNumber: string;
    message: string;
  }> {
    try {
      console.log('🔄 Creating appointment via API...');
      const response = await apiAdapter.appointments.createAppointment(request);
      console.log('✅ Appointment created successfully:', response);
      
      // Handle backend response format consistently
      const appointment = response.appointment || response.data?.appointment || response;
      const confirmationNumber = response.confirmationNumber || 
                                 response.data?.confirmationNumber || 
                                 appointment.confirmationNumber;
      const message = response.message || response.data?.message || 'Appointment created successfully';
      
      return {
        appointment,
        confirmationNumber,
        message
      };
    } catch (error) {
      console.error('❌ Failed to create appointment:', error);
      
      // Provide detailed error message
      if (error instanceof Error) {
        throw new Error(error.message || 'Failed to create appointment');
      }
      throw error;
    }
  },

  /**
   * Update an existing appointment
   */
  async updateAppointment(appointmentId: string, updates: Partial<Appointment>): Promise<Appointment> {
    await delay(600);
    simulateNetworkError();
    
    const appointmentIndex = mockAppointments.findIndex(apt => apt.id === appointmentId);
    if (appointmentIndex === -1) {
      throw new Error('Appointment not found');
    }
    
    const appointment = mockAppointments[appointmentIndex];
    
    // Validate status transitions
    if (updates.status) {
      const validTransitions: Record<string, string[]> = {
        'scheduled': ['completed', 'cancelled', 'rescheduled'],
        'completed': [], // Cannot change completed appointments
        'cancelled': ['scheduled'], // Can reschedule cancelled appointments
        'rescheduled': ['scheduled', 'cancelled']
      };
      
      if (!validTransitions[appointment.status]?.includes(updates.status)) {
        throw new Error(`Cannot change appointment status from ${appointment.status} to ${updates.status}`);
      }
    }
    
    // If rescheduling, validate new time slot
    if (updates.date || updates.time) {
      const newDate = updates.date || appointment.date;
      const newTime = updates.time || appointment.time;
      
      const conflictingAppointment = mockAppointments.find(apt => 
        apt.id !== appointmentId &&
        apt.doctorId === appointment.doctorId && 
        apt.date === newDate && 
        apt.time === newTime &&
        apt.status !== 'cancelled'
      );
      
      if (conflictingAppointment) {
        throw new Error('The new time slot is not available');
      }
    }
    
    mockAppointments[appointmentIndex] = { ...appointment, ...updates };
    return mockAppointments[appointmentIndex];
  },

  /**
   * Cancel an appointment
   */
  async cancelAppointment(appointmentId: string, reason?: string): Promise<void> {
    await delay(500);
    simulateNetworkError();
    
    const appointment = await this.getAppointment(appointmentId);
    if (!appointment) {
      throw new Error('Appointment not found');
    }
    
    if (appointment.status === 'completed') {
      throw new Error('Cannot cancel completed appointments');
    }
    
    if (appointment.status === 'cancelled') {
      throw new Error('Appointment is already cancelled');
    }
    
    await this.updateAppointment(appointmentId, {
      status: 'cancelled',
      notes: reason ? `${appointment.notes || ''}\nCancellation reason: ${reason}` : appointment.notes
    });
  },

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(
    appointmentId: string, 
    newDate: string, 
    newTime: string
  ): Promise<Appointment> {
    await delay(800);
    simulateNetworkError();
    
    return await this.updateAppointment(appointmentId, {
      date: newDate,
      time: newTime,
      status: 'scheduled'
    });
  },

  /**
   * Get available time slots for a doctor
   */
  async getDoctorAvailability(
    doctorId: string, 
    startDate: string, 
    endDate: string
  ): Promise<AppointmentSlot[]> {
    await delay(600);
    simulateNetworkError();
    
    const cacheKey = `${doctorId}-${startDate}-${endDate}`;
    
    if (!mockDoctorSchedules.has(cacheKey)) {
      const slots = generateDoctorAvailability(
        doctorId, 
        new Date(startDate), 
        new Date(endDate)
      );
      mockDoctorSchedules.set(cacheKey, slots);
    }
    
    return mockDoctorSchedules.get(cacheKey)!;
  },

  /**
   * Get available slots for a specific date
   */
  async getAvailableSlots(doctorId: string, date: string): Promise<AppointmentSlot[]> {
    await delay(400);
    simulateNetworkError();
    
    const slots = await this.getDoctorAvailability(doctorId, date, date);
    return slots.filter(slot => slot.available);
  },

  /**
   * Check if a specific time slot is available
   */
  async isSlotAvailable(doctorId: string, date: string, time: string): Promise<boolean> {
    await delay(200);
    simulateNetworkError();
    
    const existingAppointment = mockAppointments.find(apt => 
      apt.doctorId === doctorId && 
      apt.date === date && 
      apt.time === time &&
      apt.status !== 'cancelled'
    );
    
    return !existingAppointment;
  },

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(userId?: string, role?: 'patient' | 'doctor'): Promise<AppointmentStats> {
    await delay(500);
    simulateNetworkError();
    
    let appointments = mockAppointments;
    
    if (userId && role) {
      appointments = appointments.filter(apt => 
        role === 'patient' ? apt.patientId === userId : apt.doctorId === userId
      );
    }
    
    const today = new Date().toISOString().split('T')[0];
    
    const stats: AppointmentStats = {
      total: appointments.length,
      upcoming: appointments.filter(apt => apt.date >= today && apt.status === 'scheduled').length,
      completed: appointments.filter(apt => apt.status === 'completed').length,
      cancelled: appointments.filter(apt => apt.status === 'cancelled').length,
      byType: {},
      byStatus: {},
      averageDuration: 30 // Mock average duration
    };
    
    // Calculate by type
    appointments.forEach(apt => {
      stats.byType[apt.type] = (stats.byType[apt.type] || 0) + 1;
      stats.byStatus[apt.status] = (stats.byStatus[apt.status] || 0) + 1;
    });
    
    return stats;
  },

  /**
   * Search for available appointments
   */
  async searchAvailableAppointments(criteria: {
    specialty?: string;
    date?: string;
    timePreference?: 'morning' | 'afternoon' | 'evening';
    urgency?: 'low' | 'medium' | 'high' | 'urgent';
    maxDistance?: number;
  }): Promise<Array<{
    doctorId: string;
    doctorName: string;
    specialty: string;
    availableSlots: AppointmentSlot[];
    rating: number;
    distance: number;
  }>> {
    await delay(800);
    simulateNetworkError();
    
    // Mock search results
    const mockDoctors = [
      { id: '2', name: 'Dr. Sarah Wilson', specialty: 'Cardiology', rating: 4.9, distance: 2.3 },
      { id: '5', name: 'Dr. Michael Chen', specialty: 'Neurology', rating: 4.8, distance: 4.1 },
      { id: '3', name: 'Dr. Emily Rodriguez', specialty: 'Family Medicine', rating: 4.7, distance: 1.8 }
    ];
    
    const results = [];
    
    for (const doctor of mockDoctors) {
      if (criteria.specialty && !doctor.specialty.toLowerCase().includes(criteria.specialty.toLowerCase())) {
        continue;
      }
      
      if (criteria.maxDistance && doctor.distance > criteria.maxDistance) {
        continue;
      }
      
      const searchDate = criteria.date || new Date().toISOString().split('T')[0];
      const availableSlots = await this.getAvailableSlots(doctor.id, searchDate);
      
      // Filter by time preference
      let filteredSlots = availableSlots;
      if (criteria.timePreference) {
        filteredSlots = availableSlots.filter(slot => {
          const hour = parseInt(slot.time.split(':')[0]);
          switch (criteria.timePreference) {
            case 'morning': return hour < 12;
            case 'afternoon': return hour >= 12 && hour < 17;
            case 'evening': return hour >= 17;
            default: return true;
          }
        });
      }
      
      if (filteredSlots.length > 0) {
        results.push({
          doctorId: doctor.id,
          doctorName: doctor.name,
          specialty: doctor.specialty,
          availableSlots: filteredSlots,
          rating: doctor.rating,
          distance: doctor.distance
        });
      }
    }
    
    // Sort by rating and distance
    return results.sort((a, b) => {
      if (criteria.urgency === 'urgent') {
        return a.distance - b.distance; // Prioritize distance for urgent cases
      }
      return b.rating - a.rating; // Prioritize rating for non-urgent cases
    });
  },

  /**
   * Get appointment reminders
   */
  async getAppointmentReminders(userId: string, role: 'patient' | 'doctor' = 'patient'): Promise<Array<{
    appointmentId: string;
    message: string;
    reminderTime: string;
    type: 'upcoming' | 'overdue' | 'follow-up';
  }>> {
    await delay(400);
    simulateNetworkError();
    
    const upcomingAppointments = await this.getUpcomingAppointments(userId, role);
    const reminders = [];
    
    for (const appointment of upcomingAppointments) {
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
      const now = new Date();
      const hoursUntil = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntil <= 24 && hoursUntil > 0) {
        reminders.push({
          appointmentId: appointment.id,
          message: `Upcoming appointment ${hoursUntil < 1 ? 'in less than an hour' : `in ${Math.round(hoursUntil)} hours`}`,
          reminderTime: appointmentDateTime.toISOString(),
          type: 'upcoming' as const
        });
      }
    }
    
    return reminders;
  }
};