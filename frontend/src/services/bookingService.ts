import type { 
  Clinic, 
  Doctor, 
  DayAvailability, 
  BookingFormData, 
  AISuggestion, 
  BookingConfirmation 
} from '@/types/booking';
import apiAdapter from './apiAdapter';

export const bookingService = {
  async getClinics(): Promise<Clinic[]> {
    const response = await apiAdapter.get('/clinics');
    console.log('🏥 Raw clinics response:', response);
    
    // Handle different response formats
    const data = response.data || response;
    const clinics = data.clinics || data;
    
    console.log('🏥 Processed clinics:', clinics);
    return Array.isArray(clinics) ? clinics : [];
  },

  async getDoctorsByClinic(clinicId: string): Promise<Doctor[]> {
    const response = await apiAdapter.get(`/clinics/${clinicId}/doctors`);
    return response.data || response;
  },

  async getDoctorsBySpecialty(specialty: string): Promise<Doctor[]> {
    const response = await apiAdapter.get('/doctors', { specialty });
    return response.data || response;
  },

  async getDoctor(doctorId: string): Promise<Doctor | null> {
    try {
      const response = await apiAdapter.get(`/doctors/${doctorId}`);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch doctor:', error);
      return null;
    }
  },

  async getDoctorAvailability(doctorId: string, startDate: string, endDate: string): Promise<DayAvailability[]> {
    const response = await apiAdapter.get(`/doctors/${doctorId}/availability`, {
      startDate,
      endDate
    });
    return response.data || response;
  },

  async getAISuggestions(formData: Partial<BookingFormData>): Promise<AISuggestion[]> {
    const response = await apiAdapter.post('/appointments/ai-suggestions', formData);
    return response.data || response;
  },

  async bookAppointment(formData: BookingFormData): Promise<BookingConfirmation> {
    const appointmentRequest = {
      doctor: formData.doctorId,
      appointmentDate: `${formData.date}T${formData.time}:00`,
      duration: 30,
      type: formData.appointmentType,
      reason: formData.reason,
      notes: formData.notes || '',
      isEmergency: formData.urgency === 'urgent' || formData.urgency === 'emergency'
    };

    const response = await apiAdapter.appointments.createAppointment(appointmentRequest);
    
    // Backend returns: { appointment, confirmationNumber, message }
    const appointment = response.appointment || response;
    const confirmationNumber = response.confirmationNumber || appointment.confirmationNumber || 'UNKNOWN';
    
    // Get doctor info for confirmation
    const doctor = await this.getDoctor(formData.doctorId);
    
    return {
      appointmentId: appointment._id || appointment.id || 'unknown',
      patientName: appointment.patient?.name || 'Patient',
      doctorName: doctor?.name || appointment.doctor?.name || 'Doctor',
      clinicName: doctor?.clinicName || 'Clinic',
      date: formData.date,
      time: formData.time,
      appointmentType: formData.appointmentType,
      reason: formData.reason,
      estimatedDuration: appointment.duration || 30,
      consultationFee: doctor?.consultationFee || 200,
      confirmationCode: confirmationNumber,
      instructions: [
        'Please arrive 15 minutes early for check-in',
        'Bring a valid ID and insurance card',
        'Bring a list of current medications',
        'Wear comfortable clothing for examination'
      ]
    };
  },

  async cancelAppointment(appointmentId: string): Promise<void> {
    await apiAdapter.appointments.cancelAppointment(appointmentId);
  },

  async rescheduleAppointment(appointmentId: string, newDate: string, newTime: string): Promise<void> {
    await apiAdapter.appointments.updateAppointment(appointmentId, {
      date: newDate,
      time: newTime,
      status: 'scheduled'
    });
  }
};
