import apiAdapter from '@/services/apiAdapter';
import type { 
  Clinic, 
  Doctor, 
  DayAvailability, 
  BookingFormData, 
  BookingConfirmation,
  AISuggestion 
} from '@/types/booking';

// Fallback data for clinics
const fallbackClinics: Clinic[] = [
  {
    id: 'clinic-1',
    name: 'City General Hospital',
    address: '123 Main St, Anytown, USA',
    phone: '(555) 123-4567',
    rating: 4.5,
    specialties: ['Emergency Medicine', 'Cardiology', 'Surgery', 'Pediatrics'],
    image: '',
    isOpen: true,
    openingHours: {
      monday: { open: '08:00', close: '22:00' },
      tuesday: { open: '08:00', close: '22:00' },
      wednesday: { open: '08:00', close: '22:00' },
      thursday: { open: '08:00', close: '22:00' },
      friday: { open: '08:00', close: '22:00' },
      saturday: { open: '09:00', close: '20:00' },
      sunday: { open: '10:00', close: '18:00' }
    },
    distance: 2.5
  },
  {
    id: 'clinic-2',
    name: 'Westside Medical Center',
    address: '456 Oak Ave, Westside, USA',
    phone: '(555) 987-6543',
    rating: 4.7,
    specialties: ['Family Medicine', 'Dermatology', 'Orthopedics'],
    image: '',
    isOpen: true,
    openingHours: {
      monday: { open: '07:00', close: '19:00' },
      tuesday: { open: '07:00', close: '19:00' },
      wednesday: { open: '07:00', close: '19:00' },
      thursday: { open: '07:00', close: '19:00' },
      friday: { open: '07:00', close: '19:00' },
      saturday: { open: '08:00', close: '14:00' },
      sunday: { open: '09:00', close: '12:00' }
    },
    distance: 4.2
  },
  {
    id: 'clinic-3',
    name: 'Eastside Specialty Clinic',
    address: '789 Pine St, Eastside, USA',
    phone: '(555) 246-8135',
    rating: 4.8,
    specialties: ['Neurology', 'Psychiatry', 'Endocrinology'],
    image: '',
    isOpen: true,
    openingHours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '18:00' },
      saturday: { open: '09:00', close: '14:00' },
      sunday: { open: null, close: null }
    },
    distance: 6.1
  },
  {
    id: 'clinic-4',
    name: 'Northside Community Health',
    address: '321 Elm St, Northside, USA',
    phone: '(555) 369-2580',
    rating: 4.4,
    specialties: ['Family Medicine', 'Mental Health', 'Preventive Care'],
    image: '',
    isOpen: true,
    openingHours: {
      monday: { open: '08:00', close: '17:00' },
      tuesday: { open: '08:00', close: '17:00' },
      wednesday: { open: '08:00', close: '17:00' },
      thursday: { open: '08:00', close: '17:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '09:00', close: '13:00' },
      sunday: { open: null, close: null }
    },
    distance: 8.3
  },
  {
    id: 'clinic-5',
    name: 'Southside Urgent Care',
    address: '654 Maple Ave, Southside, USA',
    phone: '(555) 147-2580',
    rating: 4.2,
    specialties: ['Urgent Care', 'X-Ray', 'Lab Services'],
    image: '',
    isOpen: true,
    openingHours: {
      monday: { open: '00:00', close: '23:59' },
      tuesday: { open: '00:00', close: '23:59' },
      wednesday: { open: '00:00', close: '23:59' },
      thursday: { open: '00:00', close: '23:59' },
      friday: { open: '00:00', close: '23:59' },
      saturday: { open: '00:00', close: '23:59' },
      sunday: { open: '00:00', close: '23:59' }
    },
    distance: 3.7
  }
];

// Fallback data for doctors
const fallbackDoctors: Record<string, Doctor[]> = {
  'clinic-1': [
    {
      id: 'doctor-1',
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      clinicId: 'clinic-1',
      clinicName: 'City General Hospital',
      rating: 4.8,
      experience: 12,
      education: ['MD from Harvard Medical School', 'Cardiology Fellowship at Mayo Clinic'],
      languages: ['English', 'Spanish'],
      avatar: '',
      consultationFee: 250,
      nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isAvailable: true
    },
    {
      id: 'doctor-2',
      name: 'Dr. Michael Chen',
      specialty: 'Emergency Medicine',
      clinicId: 'clinic-1',
      clinicName: 'City General Hospital',
      rating: 4.6,
      experience: 8,
      education: ['MD from Johns Hopkins', 'Emergency Medicine Residency at UCLA'],
      languages: ['English', 'Mandarin'],
      avatar: '',
      consultationFee: 200,
      nextAvailable: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      isAvailable: true
    },
    {
      id: 'doctor-3',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrics',
      clinicId: 'clinic-1',
      clinicName: 'City General Hospital',
      rating: 4.9,
      experience: 10,
      education: ['MD from Stanford University', 'Pediatrics Residency at Children\'s Hospital Boston'],
      languages: ['English', 'Spanish'],
      avatar: '',
      consultationFee: 180,
      nextAvailable: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
      isAvailable: true
    }
  ],
  'clinic-2': [
    {
      id: 'doctor-4',
      name: 'Dr. James Wilson',
      specialty: 'Family Medicine',
      clinicId: 'clinic-2',
      clinicName: 'Westside Medical Center',
      rating: 4.5,
      experience: 15,
      education: ['MD from University of Michigan', 'Family Medicine Residency at Cleveland Clinic'],
      languages: ['English'],
      avatar: '',
      consultationFee: 150,
      nextAvailable: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
      isAvailable: true
    },
    {
      id: 'doctor-5',
      name: 'Dr. Lisa Thompson',
      specialty: 'Dermatology',
      clinicId: 'clinic-2',
      clinicName: 'Westside Medical Center',
      rating: 4.7,
      experience: 9,
      education: ['MD from NYU School of Medicine', 'Dermatology Residency at Mount Sinai'],
      languages: ['English', 'French'],
      avatar: '',
      consultationFee: 220,
      nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isAvailable: true
    }
  ],
  'clinic-3': [
    {
      id: 'doctor-6',
      name: 'Dr. Robert Kim',
      specialty: 'Neurology',
      clinicId: 'clinic-3',
      clinicName: 'Eastside Specialty Clinic',
      rating: 4.8,
      experience: 14,
      education: ['MD from Yale School of Medicine', 'Neurology Residency at Massachusetts General'],
      languages: ['English', 'Korean'],
      avatar: '',
      consultationFee: 300,
      nextAvailable: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      isAvailable: true
    },
    {
      id: 'doctor-7',
      name: 'Dr. Amanda Foster',
      specialty: 'Psychiatry',
      clinicId: 'clinic-3',
      clinicName: 'Eastside Specialty Clinic',
      rating: 4.6,
      experience: 11,
      education: ['MD from Columbia University', 'Psychiatry Residency at Bellevue Hospital'],
      languages: ['English'],
      avatar: '',
      consultationFee: 280,
      nextAvailable: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
      isAvailable: true
    }
  ],
  'clinic-4': [
    {
      id: 'doctor-8',
      name: 'Dr. David Martinez',
      specialty: 'Family Medicine',
      clinicId: 'clinic-4',
      clinicName: 'Northside Community Health',
      rating: 4.4,
      experience: 7,
      education: ['MD from University of Texas', 'Family Medicine Residency at Baylor'],
      languages: ['English', 'Spanish'],
      avatar: '',
      consultationFee: 140,
      nextAvailable: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
      isAvailable: true
    },
    {
      id: 'doctor-9',
      name: 'Dr. Jennifer Lee',
      specialty: 'Psychiatry',
      clinicId: 'clinic-4',
      clinicName: 'Northside Community Health',
      rating: 4.5,
      experience: 6,
      education: ['MD from University of Washington', 'Psychiatry Residency at Seattle Children\'s'],
      languages: ['English', 'Korean'],
      avatar: '',
      consultationFee: 160,
      nextAvailable: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      isAvailable: true
    }
  ],
  'clinic-5': [
    {
      id: 'doctor-10',
      name: 'Dr. Mark Anderson',
      specialty: 'Urgent Care',
      clinicId: 'clinic-5',
      clinicName: 'Southside Urgent Care',
      rating: 4.2,
      experience: 5,
      education: ['MD from University of Florida', 'Emergency Medicine Residency at Jackson Memorial'],
      languages: ['English'],
      avatar: '',
      consultationFee: 120,
      nextAvailable: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      isAvailable: true
    }
  ]
};

// Store fallback appointments locally for confirmation page
const fallbackAppointments = new Map<string, any>();

export const bookingService = {
  async getClinics(): Promise<Clinic[]> {
    console.log('🏥 Starting getClinics API call...');
    try {
      const response = await apiAdapter.get('/clinics');
      console.log('🏥 Raw clinics response:', response);
      
      // Handle different response formats
      const data = response.data || response;
      const clinics = data.clinics || data;
      
      // Transform backend format to frontend format
      const transformedClinics = Array.isArray(clinics) ? clinics.map((clinic: any) => ({
        id: clinic.id || clinic._id,
        name: clinic.name,
        address: clinic.address,
        phone: clinic.phone || '(555) 000-0000',
        rating: clinic.rating,
        specialties: clinic.specialties || [],
        image: clinic.image,
        isOpen: clinic.isOpen,
        openingHours: clinic.openingHours || {},
        distance: clinic.distance
      })) : [];
      
      console.log('🏥 Processed clinics:', transformedClinics);
      return transformedClinics;
    } catch (error) {
      console.warn('🏥 Backend unavailable, using fallback clinics data:', error);
      console.log('🏥 Returning fallback clinics:', fallbackClinics.length, 'clinics');
      return fallbackClinics;
    }
  },

  async getDoctorsByClinic(clinicId: string): Promise<Doctor[]> {
    try {
      const response = await apiAdapter.get(`/clinics/${clinicId}/doctors`);
      const data = response.data || response;
      const doctors = data.doctors || data;
      
      // Transform backend format to frontend format
      const transformedDoctors = Array.isArray(doctors) ? doctors.map((doctor: any) => ({
        id: doctor.id || doctor._id,
        name: doctor.name,
        specialty: doctor.specialty,
        clinicId: doctor.clinicId,
        clinicName: doctor.clinicName,
        rating: doctor.rating,
        experience: doctor.experience,
        education: doctor.education || [],
        languages: doctor.languages || [],
        avatar: doctor.avatar,
        consultationFee: doctor.consultationFee,
        nextAvailable: doctor.nextAvailable,
        isAvailable: doctor.isAvailable
      })) : [];
      
      return transformedDoctors;
    } catch (error) {
      console.warn('👨‍⚕️ Backend unavailable, using fallback doctors data:', error);
      return fallbackDoctors[clinicId] || [];
    }
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

  async getAppointment(appointmentId: string): Promise<any> {
    // First check if it's a fallback appointment
    if (fallbackAppointments.has(appointmentId)) {
      console.log('📋 Returning fallback appointment data for:', appointmentId);
      return fallbackAppointments.get(appointmentId);
    }

    try {
      const response = await apiAdapter.appointments.getAppointment(appointmentId);
      return response.data || response;
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
      return null;
    }
  },

  async getDoctorAvailability(doctorId: string, startDate: string, endDate: string): Promise<DayAvailability[]> {
    try {
      const response = await apiAdapter.get(`/doctors/${doctorId}/availability`, {
        startDate,
        endDate
      });
      return response.data || response;
    } catch (error) {
      console.warn('📅 Backend unavailable, generating fallback availability data:', error);
      
      // Generate fallback availability data
      const availability: DayAvailability[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        const dateStr = date.toISOString().split('T')[0];
        
        // Generate time slots from 9 AM to 5 PM (every 30 minutes)
        const slots = [];
        for (let hour = 9; hour < 17; hour++) {
          for (let minute = 0; minute < 60; minute += 30) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            // Make some slots unavailable for realism
            const isAvailable = Math.random() > 0.3;
            slots.push({
              time,
              available: isAvailable,
              type: 'regular' as const,
              duration: 30
            });
          }
        }

        availability.push({
          date: dateStr,
          dayOfWeek,
          isAvailable: slots.some(slot => slot.available),
          slots
        });
      }
      
      return availability;
    }
  },

  async getAISuggestions(formData: Partial<BookingFormData>): Promise<AISuggestion[]> {
    try {
      const response = await apiAdapter.post('/appointments/ai-suggestions', formData);
      return response.data || response;
    } catch (error) {
      console.warn('🤖 Backend unavailable, using fallback AI suggestions:', error);
      
      // Generate fallback AI suggestions based on form data
      const suggestions: AISuggestion[] = [];
      
      if (formData.reason) {
        const reasonLower = formData.reason.toLowerCase();
        
        if (reasonLower.includes('emergency') || reasonLower.includes('urgent')) {
          suggestions.push({
            type: 'urgency',
            title: 'Urgent Care Recommended',
            description: 'Based on your symptoms, urgent care may be more appropriate than a scheduled appointment.',
            confidence: 0.85,
            action: {
              label: 'Switch to Urgent Care',
              data: {
                urgency: 'urgent',
                appointmentType: 'emergency'
              }
            }
          });
        }
        
        if (reasonLower.includes('heart') || reasonLower.includes('chest')) {
          suggestions.push({
            type: 'doctor-recommendation',
            title: 'Consider Cardiology',
            description: 'Your symptoms may require a cardiology specialist.',
            confidence: 0.9,
            action: {
              label: 'Select Cardiologist',
              data: {
                clinicId: 'clinic-1',
                doctorId: 'doctor-1'
              }
            }
          });
        }
        
        if (reasonLower.includes('skin') || reasonLower.includes('rash')) {
          suggestions.push({
            type: 'doctor-recommendation',
            title: 'Consider Dermatology',
            description: 'A dermatologist may be best suited for your skin concerns.',
            confidence: 0.8,
            action: {
              label: 'Select Dermatologist',
              data: {
                clinicId: 'clinic-2',
                doctorId: 'doctor-5'
              }
            }
          });
        }
      }
      
      // Add general suggestions
      if (!formData.date) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        suggestions.push({
          type: 'best-time',
          title: 'Earliest Available',
          description: 'Next available appointment is tomorrow morning.',
          confidence: 0.7,
          action: {
            label: 'Book Tomorrow 9AM',
            data: {
              date: tomorrow.toISOString().split('T')[0],
              time: '09:00'
            }
          }
        });
      }

      return suggestions;
    }
  },

  async bookAppointment(formData: BookingFormData): Promise<BookingConfirmation> {
    try {
      console.log('🔍 Starting booking process...');
      console.log('📝 Form data:', formData);
      
      const appointmentRequest = {
        doctor: formData.doctorId, // Backend validation expects 'doctor' field
        appointmentDate: `${formData.date}T${formData.time}:00`,
        duration: 30,
        type: formData.appointmentType,
        reason: formData.reason,
        // Remove notes and isEmergency as they're not in the backend schema
      };

      console.log('📤 Sending API request:', appointmentRequest);

      const response = await apiAdapter.appointments.createAppointment(appointmentRequest);
      
      console.log('✅ API Response received:', response);
      
      // Backend returns: { appointment, confirmationNumber, message }
      const appointment = response.appointment || response;
      const confirmationNumber = response.confirmationNumber || appointment.confirmationNumber || 'UNKNOWN';
      
      console.log('📋 Appointment created:', appointment._id);
      console.log('🔢 Confirmation number:', confirmationNumber);
      
      // Get doctor info for confirmation
      const doctor = await this.getDoctor(formData.doctorId);
      
      const confirmation = {
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

      // Store appointment data for confirmation page
      fallbackAppointments.set(confirmation.appointmentId, {
        ...appointment,
        confirmationNumber,
        doctor,
        ...confirmation
      });

      return confirmation;
    } catch (error) {
      console.error('❌ Booking API Error:', error);
      console.error('📊 Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        status: (error as any).response?.status,
        statusText: (error as any).response?.statusText,
        data: (error as any).response?.data
      });
      console.warn('📋 Backend unavailable, using fallback booking confirmation:', error);
      
      // Generate fallback confirmation
      const doctor = fallbackDoctors[formData.clinicId]?.find(d => d.id === formData.doctorId);
      const clinic = fallbackClinics.find(c => c.id === formData.clinicId);
      
      const appointmentId = `fallback-${Date.now()}`;
      const confirmationCode = `DEMO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      const confirmation = {
        appointmentId,
        patientName: 'Patient',
        doctorName: doctor?.name || 'Doctor',
        clinicName: clinic?.name || 'Clinic',
        date: formData.date,
        time: formData.time,
        appointmentType: formData.appointmentType,
        reason: formData.reason,
        estimatedDuration: 30,
        consultationFee: doctor?.consultationFee || 200,
        confirmationCode,
        instructions: [
          'Please arrive 15 minutes early for check-in',
          'Bring a valid ID and insurance card',
          'Bring a list of current medications',
          'Wear comfortable clothing for examination',
          'Note: This is a demo booking. In production, this would be saved to database.'
        ]
      };

      // Store fallback appointment data for confirmation page
      fallbackAppointments.set(appointmentId, {
        _id: appointmentId,
        confirmationNumber: confirmationCode,
        patient: { name: 'Patient' },
        doctor: doctor ? {
          name: doctor.name,
          email: `${doctor.name.toLowerCase().replace(/\s/g, '.').replace(/[^a-z0-9]/g, '')}@demo.com`,
          specialty: doctor.specialty
        } : { name: 'Doctor' },
        appointmentDate: `${formData.date}T${formData.time}:00`,
        duration: 30,
        type: formData.appointmentType,
        reason: formData.reason || 'No reason provided',
        status: 'confirmed',
        confirmation
      });

      return confirmation;
    }
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
