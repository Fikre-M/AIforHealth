import type { Appointment } from '@/types';
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
  type: 'consultation' | 'follow_up' | 'emergency';
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

export const appointmentService = {
  /**
   * Get appointments with optional filtering
   */
  async getAppointments(filter?: AppointmentFilter): Promise<Appointment[]> {
    console.log('🔄 Fetching appointments from API...');
    const response = await apiAdapter.appointments.getAppointments(filter);
    console.log('✅ Appointments fetched successfully:', response);
    
    // Handle backend response format: response.data.appointments or response.appointments
    return response.appointments || response.data?.appointments || response;
  },

  /**
   * Search appointments with enhanced filtering and pagination
   */
  async searchAppointments(params: AppointmentSearchParams): Promise<{
    appointments: Appointment[];
    total: number;
    hasMore: boolean;
  }> {
    const response = await apiAdapter.get('/appointments/search', { params });
    return response.data;
  },

  /**
   * Get a specific appointment by ID
   */
  async getAppointment(appointmentId: string): Promise<Appointment | null> {
    console.log('🔄 Fetching appointment by ID:', appointmentId);
    
    const response = await apiAdapter.appointments.getAppointment(appointmentId);
    console.log('✅ Appointment fetched successfully:', response);
    
    // Transform backend format to frontend format if needed
    if (response._id) {
      return {
        id: response._id,
        patientId: response.patient?._id || response.patient,
        doctorId: response.doctor?._id || response.doctor,
        date: response.appointmentDate?.split('T')[0] || response.date,
        time: new Date(response.appointmentDate).toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        }),
        status: response.status,
        type: response.type,
        notes: response.notes || response.reason,
        ...response
      };
    }
    
    return response;
  },

  /**
   * Get upcoming appointments for a user
   */
  async getUpcomingAppointments(userId: string, role: 'patient' | 'doctor' = 'patient'): Promise<Appointment[]> {
    const response = await apiAdapter.get('/appointments/upcoming', {
      userId,
      role
    });
    return response.data || response;
  },

  /**
   * Get appointment history for a user
   */
  async getAppointmentHistory(userId: string, role: 'patient' | 'doctor' = 'patient'): Promise<Appointment[]> {
    const response = await apiAdapter.get('/appointments/history', {
      userId,
      role
    });
    return response.data || response;
  },

  /**
   * Create a new appointment
   */
  async createAppointment(request: AppointmentRequest): Promise<{
    appointment: Appointment;
    confirmationNumber: string;
    message: string;
  }> {
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
  },

  /**
   * Update an existing appointment
   */
  async updateAppointment(appointmentId: string, updates: Partial<Appointment>): Promise<Appointment> {
    const response = await apiAdapter.appointments.updateAppointment(appointmentId, updates);
    return response.appointment || response.data?.appointment || response;
  },

  /**
   * Cancel an appointment
   */
  async cancelAppointment(appointmentId: string, reason?: string): Promise<void> {
    await apiAdapter.appointments.cancelAppointment(appointmentId);
  },

  /**
   * Reschedule an appointment
   */
  async rescheduleAppointment(
    appointmentId: string, 
    newDate: string, 
    newTime: string
  ): Promise<Appointment> {
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
    const response = await apiAdapter.get(`/doctors/${doctorId}/availability`, {
      startDate,
      endDate
    });
    return response.data || response;
  },

  /**
   * Get available slots for a specific date
   */
  async getAvailableSlots(doctorId: string, date: string): Promise<AppointmentSlot[]> {
    const response = await apiAdapter.get(`/doctors/${doctorId}/available-slots`, {
      date
    });
    return response.data || response;
  },

  /**
   * Check if a specific time slot is available
   */
  async isSlotAvailable(doctorId: string, date: string, time: string): Promise<boolean> {
    const response = await apiAdapter.get(`/doctors/${doctorId}/slot-availability`, {
      date,
      time
    });
    return response.available || response.data?.available || false;
  },

  /**
   * Get appointment statistics
   */
  async getAppointmentStats(userId?: string, role?: 'patient' | 'doctor'): Promise<AppointmentStats> {
    const response = await apiAdapter.get('/appointments/stats', {
      userId,
      role
    });
    return response.data || response;
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
    const response = await apiAdapter.post('/appointments/search-available', criteria);
    return response.data || response;
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
    const response = await apiAdapter.get('/appointments/reminders', {
      userId,
      role
    });
    return response.data || response;
  }
};
