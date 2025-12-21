import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ClinicSelector } from '@/components/booking/ClinicSelector';
import { DoctorSelector } from '@/components/booking/DoctorSelector';
import { DateTimePicker } from '@/components/booking/DateTimePicker';
import { AISuggestionPanel } from '@/components/booking/AISuggestionPanel';
import { AppointmentConfirmation } from '@/components/booking/AppointmentConfirmation';
import { bookingService } from '@/services/bookingService';
import type { 
  Clinic, 
  Doctor, 
  DayAvailability, 
  BookingFormData, 
  AISuggestion, 
  BookingConfirmation 
} from '@/types/booking';
import { addDays } from 'date-fns';

type BookingStep = 'clinic' | 'doctor' | 'datetime' | 'details' | 'confirmation';

export function AppointmentBooking() {
  const [currentStep, setCurrentStep] = useState<BookingStep>('clinic');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  
  const [formData, setFormData] = useState<BookingFormData>({
    clinicId: '',
    doctorId: '',
    date: '',
    time: '',
    appointmentType: 'consultation',
    reason: '',
    notes: '',
    urgency: 'routine',
    preferredLanguage: 'English'
  });

  const [loading, setLoading] = useState({
    clinics: false,
    doctors: false,
    availability: false,
    suggestions: false,
    booking: false
  });

  // Load clinics on component mount
  useEffect(() => {
    loadClinics();
  }, []);

  // Load doctors when clinic is selected
  useEffect(() => {
    if (formData.clinicId) {
      loadDoctors(formData.clinicId);
    }
  }, [formData.clinicId]);

  // Load availability when doctor is selected
  useEffect(() => {
    if (formData.doctorId) {
      loadAvailability(formData.doctorId);
    }
  }, [formData.doctorId]);

  // Generate AI suggestions when form data changes
  useEffect(() => {
    if (formData.clinicId || formData.doctorId || formData.reason) {
      generateSuggestions();
    }
  }, [formData.clinicId, formData.doctorId, formData.reason, formData.date]);

  const loadClinics = async () => {
    setLoading(prev => ({ ...prev, clinics: true }));
    try {
      const clinicsData = await bookingService.getClinics();
      setClinics(clinicsData);
    } catch (error) {
      console.error('Error loading clinics:', error);
    } finally {
      setLoading(prev => ({ ...prev, clinics: false }));
    }
  };

  const loadDoctors = async (clinicId: string) => {
    setLoading(prev => ({ ...prev, doctors: true }));
    try {
      const doctorsData = await bookingService.getDoctorsByClinic(clinicId);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setLoading(prev => ({ ...prev, doctors: false }));
    }
  };

  const loadAvailability = async (doctorId: string) => {
    setLoading(prev => ({ ...prev, availability: true }));
    try {
      const today = new Date();
      const endDate = addDays(today, 14); // Next 2 weeks
      const availabilityData = await bookingService.getDoctorAvailability(
        doctorId,
        today.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setAvailability(availabilityData);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(prev => ({ ...prev, availability: false }));
    }
  };

  const generateSuggestions = async () => {
    setLoading(prev => ({ ...prev, suggestions: true }));
    try {
      const suggestionsData = await bookingService.getAISuggestions(formData);
      setSuggestions(suggestionsData);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setLoading(prev => ({ ...prev, suggestions: false }));
    }
  };

  const handleApplySuggestion = (suggestion: AISuggestion) => {
    if (suggestion.action) {
      const { data } = suggestion.action;
      setFormData(prev => ({ ...prev, ...data }));
      
      // Auto-advance to next step if suggestion provides complete data
      if (data.time && currentStep === 'datetime') {
        setCurrentStep('details');
      }
    }
  };

  const handleBookAppointment = async () => {
    setLoading(prev => ({ ...prev, booking: true }));
    try {
      const confirmationData = await bookingService.bookAppointment(formData);
      setConfirmation(confirmationData);
      setCurrentStep('confirmation');
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('Failed to book appointment. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, booking: false }));
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 'clinic': return formData.clinicId;
      case 'doctor': return formData.doctorId;
      case 'datetime': return formData.date && formData.time;
      case 'details': return formData.reason.trim();
      default: return false;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'clinic': return 'Select Clinic';
      case 'doctor': return 'Choose Doctor';
      case 'datetime': return 'Pick Date & Time';
      case 'details': return 'Appointment Details';
      case 'confirmation': return 'Confirmation';
      default: return '';
    }
  };

  const appointmentTypeOptions = [
    { value: 'consultation', label: 'New Consultation' },
    { value: 'follow-up', label: 'Follow-up Visit' },
    { value: 'check-up', label: 'Routine Check-up' },
    { value: 'emergency', label: 'Emergency Consultation' }
  ];

  const urgencyOptions = [
    { value: 'routine', label: 'Routine (within 2 weeks)' },
    { value: 'urgent', label: 'Urgent (within 48 hours)' },
    { value: 'emergency', label: 'Emergency (same day)' }
  ];

  if (currentStep === 'confirmation' && confirmation) {
    return (
      <AppointmentConfirmation
        confirmation={confirmation}
        onClose={() => {
          // Reset form and go back to start
          setCurrentStep('clinic');
          setFormData({
            clinicId: '',
            doctorId: '',
            date: '',
            time: '',
            appointmentType: 'consultation',
            reason: '',
            notes: '',
            urgency: 'routine',
            preferredLanguage: 'English'
          });
          setConfirmation(null);
        }}
        onAddToCalendar={() => {
          // In real app, would generate calendar event
          alert('Calendar integration would be implemented here');
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['clinic', 'doctor', 'datetime', 'details'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep === step
                  ? 'bg-medical-600 text-white'
                  : index < ['clinic', 'doctor', 'datetime', 'details'].indexOf(currentStep)
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {index < ['clinic', 'doctor', 'datetime', 'details'].indexOf(currentStep) ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  index + 1
                )}
              </div>
              {index < 3 && (
                <div className={`w-16 h-0.5 mx-2 ${
                  index < ['clinic', 'doctor', 'datetime', 'details'].indexOf(currentStep)
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-gray-900">{getStepTitle()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 'clinic' && (
            <ClinicSelector
              clinics={clinics}
              selectedClinicId={formData.clinicId}
              onSelectClinic={(clinicId) => {
                setFormData(prev => ({ ...prev, clinicId, doctorId: '', date: '', time: '' }));
                setDoctors([]);
                setAvailability([]);
              }}
              isLoading={loading.clinics}
            />
          )}

          {currentStep === 'doctor' && (
            <DoctorSelector
              doctors={doctors}
              selectedDoctorId={formData.doctorId}
              onSelectDoctor={(doctorId) => {
                setFormData(prev => ({ ...prev, doctorId, date: '', time: '' }));
                setAvailability([]);
              }}
              isLoading={loading.doctors}
            />
          )}

          {currentStep === 'datetime' && (
            <DateTimePicker
              availability={availability}
              selectedDate={formData.date}
              selectedTime={formData.time}
              onSelectDate={(date) => setFormData(prev => ({ ...prev, date, time: '' }))}
              onSelectTime={(time) => setFormData(prev => ({ ...prev, time }))}
              isLoading={loading.availability}
            />
          )}

          {currentStep === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Appointment Type"
                  value={formData.appointmentType}
                  onChange={(e) => setFormData(prev => ({ ...prev, appointmentType: e.target.value as any }))}
                  options={appointmentTypeOptions}
                  required
                />
                <Select
                  label="Urgency Level"
                  value={formData.urgency}
                  onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as any }))}
                  options={urgencyOptions}
                  required
                />
              </div>

              <Input
                label="Reason for Visit"
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Describe your symptoms or reason for the appointment"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional information you'd like the doctor to know"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent"
                />
              </div>
            </div>
          )}
        </div>

        {/* AI Suggestions Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <AISuggestionPanel
              suggestions={suggestions}
              onApplySuggestion={handleApplySuggestion}
              isLoading={loading.suggestions}
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
        <Button
          variant="outline"
          onClick={() => {
            const steps: BookingStep[] = ['clinic', 'doctor', 'datetime', 'details'];
            const currentIndex = steps.indexOf(currentStep);
            if (currentIndex > 0) {
              setCurrentStep(steps[currentIndex - 1]);
            }
          }}
          disabled={currentStep === 'clinic'}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center space-x-4">
          {currentStep === 'details' ? (
            <Button
              variant="primary"
              onClick={handleBookAppointment}
              disabled={!canProceedToNext() || loading.booking}
            >
              {loading.booking ? 'Booking...' : 'Book Appointment'}
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => {
                const steps: BookingStep[] = ['clinic', 'doctor', 'datetime', 'details'];
                const currentIndex = steps.indexOf(currentStep);
                if (currentIndex < steps.length - 1) {
                  setCurrentStep(steps[currentIndex + 1]);
                }
              }}
              disabled={!canProceedToNext()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}