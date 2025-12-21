import type { 
  Clinic, 
  Doctor, 
  DayAvailability, 
  TimeSlot, 
  BookingFormData, 
  AISuggestion, 
  BookingConfirmation 
} from '@/types/booking';

// Mock data for clinics
const mockClinics: Clinic[] = [
  {
    id: '1',
    name: 'City Medical Center',
    address: '123 Main St, Downtown',
    phone: '+1 (555) 123-4567',
    rating: 4.8,
    specialties: ['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine'],
    distance: 2.3,
    isOpen: true,
    openingHours: {
      monday: { open: '08:00', close: '18:00' },
      tuesday: { open: '08:00', close: '18:00' },
      wednesday: { open: '08:00', close: '18:00' },
      thursday: { open: '08:00', close: '18:00' },
      friday: { open: '08:00', close: '17:00' },
      saturday: { open: '09:00', close: '15:00' },
      sunday: null
    }
  },
  {
    id: '2',
    name: 'Westside Health Clinic',
    address: '456 Oak Ave, Westside',
    phone: '+1 (555) 234-5678',
    rating: 4.6,
    specialties: ['Family Medicine', 'Pediatrics', 'Dermatology'],
    distance: 4.1,
    isOpen: true,
    openingHours: {
      monday: { open: '07:00', close: '19:00' },
      tuesday: { open: '07:00', close: '19:00' },
      wednesday: { open: '07:00', close: '19:00' },
      thursday: { open: '07:00', close: '19:00' },
      friday: { open: '07:00', close: '19:00' },
      saturday: { open: '08:00', close: '16:00' },
      sunday: { open: '10:00', close: '14:00' }
    }
  },
  {
    id: '3',
    name: 'University Hospital',
    address: '789 University Blvd, Campus',
    phone: '+1 (555) 345-6789',
    rating: 4.9,
    specialties: ['All Specialties', 'Emergency Care', 'Surgery', 'Oncology'],
    distance: 6.8,
    isOpen: true,
    openingHours: {
      monday: { open: '00:00', close: '23:59' },
      tuesday: { open: '00:00', close: '23:59' },
      wednesday: { open: '00:00', close: '23:59' },
      thursday: { open: '00:00', close: '23:59' },
      friday: { open: '00:00', close: '23:59' },
      saturday: { open: '00:00', close: '23:59' },
      sunday: { open: '00:00', close: '23:59' }
    }
  }
];

// Mock data for doctors
const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Wilson',
    specialty: 'Cardiology',
    clinicId: '1',
    rating: 4.9,
    experience: 12,
    education: ['MD - Harvard Medical School', 'Cardiology Fellowship - Mayo Clinic'],
    languages: ['English', 'Spanish'],
    consultationFee: 250,
    nextAvailable: '2024-01-16T09:00:00',
    isAvailable: true
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Neurology',
    clinicId: '1',
    rating: 4.8,
    experience: 15,
    education: ['MD - Johns Hopkins', 'Neurology Residency - UCSF'],
    languages: ['English', 'Mandarin'],
    consultationFee: 280,
    nextAvailable: '2024-01-17T14:00:00',
    isAvailable: true
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Family Medicine',
    clinicId: '2',
    rating: 4.7,
    experience: 8,
    education: ['MD - UCLA', 'Family Medicine Residency - Stanford'],
    languages: ['English', 'Spanish', 'Portuguese'],
    consultationFee: 180,
    nextAvailable: '2024-01-15T11:00:00',
    isAvailable: true
  },
  {
    id: '4',
    name: 'Dr. James Park',
    specialty: 'Dermatology',
    clinicId: '2',
    rating: 4.6,
    experience: 10,
    education: ['MD - NYU', 'Dermatology Residency - Mount Sinai'],
    languages: ['English', 'Korean'],
    consultationFee: 220,
    nextAvailable: '2024-01-18T10:30:00',
    isAvailable: true
  },
  {
    id: '5',
    name: 'Dr. Lisa Thompson',
    specialty: 'Pediatrics',
    clinicId: '2',
    rating: 4.8,
    experience: 14,
    education: ['MD - University of Michigan', 'Pediatrics Residency - Children\'s Hospital'],
    languages: ['English', 'French'],
    consultationFee: 200,
    nextAvailable: '2024-01-16T15:00:00',
    isAvailable: true
  }
];

// Generate mock availability data
const generateTimeSlots = (date: string, doctorId: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 9;
  const endHour = 17;
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const isAvailable = Math.random() > 0.3; // 70% availability
      
      slots.push({
        time,
        available: isAvailable,
        type: hour < 12 ? 'regular' : hour > 15 ? 'urgent' : 'regular',
        duration: 30
      });
    }
  }
  
  return slots;
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const bookingService = {
  async getClinics(): Promise<Clinic[]> {
    await delay(500);
    return mockClinics;
  },

  async getDoctorsByClinic(clinicId: string): Promise<Doctor[]> {
    await delay(400);
    return mockDoctors.filter(doctor => doctor.clinicId === clinicId);
  },

  async getDoctorsBySpecialty(specialty: string): Promise<Doctor[]> {
    await delay(400);
    return mockDoctors.filter(doctor => 
      doctor.specialty.toLowerCase().includes(specialty.toLowerCase())
    );
  },

  async getDoctor(doctorId: string): Promise<Doctor | null> {
    await delay(300);
    return mockDoctors.find(doctor => doctor.id === doctorId) || null;
  },

  async getDoctorAvailability(doctorId: string, startDate: string, endDate: string): Promise<DayAvailability[]> {
    await delay(600);
    
    const availability: DayAvailability[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dateString = date.toISOString().split('T')[0];
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      // Skip Sundays for most doctors
      const isAvailable = dayOfWeek !== 'sunday' || doctorId === '3'; // University Hospital works 24/7
      
      availability.push({
        date: dateString,
        dayOfWeek,
        isAvailable,
        slots: isAvailable ? generateTimeSlots(dateString, doctorId) : []
      });
    }
    
    return availability;
  },

  async getAISuggestions(formData: Partial<BookingFormData>): Promise<AISuggestion[]> {
    await delay(800);
    
    const suggestions: AISuggestion[] = [];
    
    // Best time suggestion
    if (formData.doctorId && formData.date) {
      suggestions.push({
        type: 'best-time',
        title: 'Optimal Appointment Time',
        description: 'Based on your preferences and doctor availability, 10:30 AM offers the best experience with minimal wait time.',
        confidence: 0.85,
        action: {
          label: 'Select 10:30 AM',
          data: { time: '10:30' }
        }
      });
    }
    
    // Urgency assessment
    if (formData.reason) {
      const urgentKeywords = ['pain', 'urgent', 'emergency', 'severe', 'bleeding'];
      const isUrgent = urgentKeywords.some(keyword => 
        formData.reason?.toLowerCase().includes(keyword)
      );
      
      if (isUrgent) {
        suggestions.push({
          type: 'urgency',
          title: 'Urgent Care Recommended',
          description: 'Based on your symptoms, we recommend scheduling within the next 24-48 hours. Consider urgent care if symptoms worsen.',
          confidence: 0.92,
          action: {
            label: 'Find Urgent Slots',
            data: { urgency: 'urgent' }
          }
        });
      }
    }
    
    // Doctor recommendation
    if (formData.clinicId && !formData.doctorId) {
      suggestions.push({
        type: 'doctor-recommendation',
        title: 'Recommended Doctor',
        description: 'Dr. Emily Rodriguez has excellent patient reviews and specializes in your area of concern. Next available: Tomorrow at 11:00 AM.',
        confidence: 0.78,
        action: {
          label: 'Select Dr. Rodriguez',
          data: { doctorId: '3' }
        }
      });
    }
    
    return suggestions;
  },

  async bookAppointment(formData: BookingFormData): Promise<BookingConfirmation> {
    await delay(1200);
    
    const doctor = await this.getDoctor(formData.doctorId);
    const clinic = mockClinics.find(c => c.id === formData.clinicId);
    
    if (!doctor || !clinic) {
      throw new Error('Doctor or clinic not found');
    }
    
    const appointmentId = `APT-${Date.now()}`;
    const confirmationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return {
      appointmentId,
      patientName: 'John Doe', // In real app, get from auth context
      doctorName: doctor.name,
      clinicName: clinic.name,
      date: formData.date,
      time: formData.time,
      appointmentType: formData.appointmentType,
      reason: formData.reason,
      estimatedDuration: 30,
      consultationFee: doctor.consultationFee,
      confirmationCode,
      instructions: [
        'Please arrive 15 minutes early for check-in',
        'Bring a valid ID and insurance card',
        'Bring a list of current medications',
        'Wear comfortable clothing for examination'
      ]
    };
  },

  async cancelAppointment(appointmentId: string): Promise<void> {
    await delay(500);
    // In real app, would cancel the appointment
    console.log('Appointment cancelled:', appointmentId);
  },

  async rescheduleAppointment(appointmentId: string, newDate: string, newTime: string): Promise<void> {
    await delay(700);
    // In real app, would reschedule the appointment
    console.log('Appointment rescheduled:', { appointmentId, newDate, newTime });
  }
};