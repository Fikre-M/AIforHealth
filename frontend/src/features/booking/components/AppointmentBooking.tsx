import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { LoadingSkeleton, FormSkeleton } from '@/components/ui/LoadingSkeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClinicSelector } from '@/components/booking/ClinicSelector';
import { DoctorSelector } from '@/components/booking/DoctorSelector';
import { DateTimePicker } from '@/components/booking/DateTimePicker';
import { AISuggestionPanel } from '@/components/booking/AISuggestionPanel';
import { useUIState } from '@/hooks/useUIState';
import { useConcurrentOperations } from '@/hooks/useLoadingState';
import { bookingService } from '@/services/bookingService';
import type { 
  Clinic, 
  Doctor, 
  DayAvailability, 
  BookingFormData, 
  AISuggestion 
} from '@/types/booking';
import { addDays } from 'date-fns';

type BookingStep = 'clinic' | 'doctor' | 'datetime' | 'details' | 'confirmation';

export function AppointmentBooking() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<BookingStep>('clinic');
  
  // UI states for different data
  const clinicsState = useUIState<Clinic[]>({
    emptyCheck: (data) => !data || data.length === 0
  });
  
  const doctorsState = useUIState<Doctor[]>({
    emptyCheck: (data) => !data || data.length === 0
  });
  
  const availabilityState = useUIState<DayAvailability[]>({
    emptyCheck: (data) => !data || data.length === 0
  });
  
  const suggestionsState = useUIState<AISuggestion[]>({
    emptyCheck: (data) => !data || data.length === 0
  });
  
  const { executeOperation, loadingStates, errors } = useConcurrentOperations();
  
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

  // Load clinics on component mount
  useEffect(() => {
    clinicsState.executeAsync(() => bookingService.getClinics());
  }, []);

  // Load doctors when clinic is selected
  useEffect(() => {
    if (formData.clinicId) {
      doctorsState.executeAsync(() => bookingService.getDoctorsByClinic(formData.clinicId));
    }
  }, [formData.clinicId]);

  // Load availability when doctor is selected
  useEffect(() => {
    if (formData.doctorId) {
      const today = new Date();
      const endDate = addDays(today, 14); // Next 2 weeks
      availabilityState.executeAsync(() => 
        bookingService.getDoctorAvailability(
          formData.doctorId,
          today.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0]
        )
      );
    }
  }, [formData.doctorId]);

  // Generate AI suggestions when form data changes
  useEffect(() => {
    if (formData.clinicId || formData.doctorId || formData.reason) {
      suggestionsState.executeAsync(() => bookingService.getAISuggestions(formData));
    }
  }, [formData.clinicId, formData.doctorId, formData.reason, formData.date]);

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
    const result = await executeOperation('booking', async () => {
      return await bookingService.bookAppointment(formData);
    });

    if (result) {
      // Redirect to confirmation page instead of showing inline confirmation
      navigate(`/app/appointments/${result.appointmentId}/confirmation`);
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
      default: return '';
    }
  };

  const appointmentTypeOptions = [
    { value: 'consultation', label: 'New Consultation' },
    { value: 'follow_up', label: 'Follow-up Visit' },
    { value: 'routine_checkup', label: 'Routine Check-up' },
    { value: 'emergency', label: 'Emergency Consultation' }
  ];

  const urgencyOptions = [
    { value: 'routine', label: 'Routine (within 2 weeks)' },
    { value: 'urgent', label: 'Urgent (within 48 hours)' },
    { value: 'emergency', label: 'Emergency (same day)' }
  ];

  return (
    <div className="max-w-7xl mx-auto" role="main" aria-label="Appointment Booking">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {['clinic', 'doctor', 'datetime', 'details'].map((step, index) => (
            <div key={step} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step
                    ? 'bg-medical-600 text-white'
                    : index < ['clinic', 'doctor', 'datetime', 'details'].indexOf(currentStep)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
                role="progressbar"
                aria-valuenow={index + 1}
                aria-valuemax={4}
                aria-label={`Step ${index + 1}: ${step}`}
              >
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
                    : 'bg-gray-200 dark:bg-gray-700'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getStepTitle()}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {currentStep === 'clinic' && (
            <>
              {clinicsState.isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <LoadingSkeleton key={i} variant="card" className="h-32" />
                  ))}
                </div>
              ) : clinicsState.hasError() ? (
                <ErrorState
                  title="Failed to load clinics"
                  message={clinicsState.error?.message}
                  type="server"
                  onRetry={() => clinicsState.retry()}
                />
              ) : clinicsState.isEmpty ? (
                <EmptyState
                  type="generic"
                  title="No Clinics Available"
                  message="No clinics are currently available for booking"
                  showAction={false}
                />
              ) : (
                <ClinicSelector
                  clinics={clinicsState.data || []}
                  selectedClinicId={formData.clinicId}
                  onSelectClinic={(clinicId) => {
                    setFormData(prev => ({ ...prev, clinicId, doctorId: '', date: '', time: '' }));
                    doctorsState.reset();
                    availabilityState.reset();
                  }}
                  isLoading={false}
                />
              )}
            </>
          )}

          {currentStep === 'doctor' && (
            <>
              {doctorsState.isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <LoadingSkeleton key={i} variant="card" className="h-40" />
                  ))}
                </div>
              ) : doctorsState.hasError() ? (
                <ErrorState
                  title="Failed to load doctors"
                  message={doctorsState.error?.message}
                  type="server"
                  onRetry={() => doctorsState.retry()}
                />
              ) : doctorsState.isEmpty ? (
                <EmptyState
                  type="generic"
                  title="No Doctors Available"
                  message="No doctors are available at the selected clinic"
                  onAction={() => setCurrentStep('clinic')}
                  actionLabel="Choose Different Clinic"
                />
              ) : (
                <DoctorSelector
                  doctors={doctorsState.data || []}
                  selectedDoctorId={formData.doctorId}
                  onSelectDoctor={(doctorId) => {
                    setFormData(prev => ({ ...prev, doctorId, date: '', time: '' }));
                    availabilityState.reset();
                  }}
                  isLoading={false}
                />
              )}
            </>
          )}

          {currentStep === 'datetime' && (
            <>
              {availabilityState.isLoading ? (
                <div className="space-y-6">
                  <LoadingSkeleton className="h-8 w-48" />
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 14 }).map((_, i) => (
                      <LoadingSkeleton key={i} className="h-20" />
                    ))}
                  </div>
                </div>
              ) : availabilityState.hasError() ? (
                <ErrorState
                  title="Failed to load availability"
                  message={availabilityState.error?.message}
                  type="server"
                  onRetry={() => availabilityState.retry()}
                />
              ) : availabilityState.isEmpty ? (
                <EmptyState
                  type="generic"
                  title="No Available Times"
                  message="The selected doctor has no available appointment times"
                  onAction={() => setCurrentStep('doctor')}
                  actionLabel="Choose Different Doctor"
                />
              ) : (
                <DateTimePicker
                  availability={availabilityState.data || []}
                  selectedDate={formData.date}
                  selectedTime={formData.time}
                  onSelectDate={(date) => setFormData(prev => ({ ...prev, date, time: '' }))}
                  onSelectTime={(time) => setFormData(prev => ({ ...prev, time }))}
                  isLoading={false}
                />
              )}
            </>
          )}

          {currentStep === 'details' && (
            <>
              {loadingStates.booking ? (
                <FormSkeleton fields={5} />
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Appointment Type"
                      value={formData.appointmentType}
                      onChange={(e) => setFormData(prev => ({ ...prev, appointmentType: e.target.value as any }))}
                      options={appointmentTypeOptions}
                      required
                      aria-describedby="appointment-type-help"
                    />
                    <div id="appointment-type-help" className="sr-only">
                      Select the type of appointment you need
                    </div>
                    
                    <Select
                      label="Urgency Level"
                      value={formData.urgency}
                      onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as any }))}
                      options={urgencyOptions}
                      required
                      aria-describedby="urgency-help"
                    />
                    <div id="urgency-help" className="sr-only">
                      Select how urgent your appointment is
                    </div>
                  </div>

                  <Input
                    label="Reason for Visit"
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Describe your symptoms or reason for the appointment"
                    required
                    aria-describedby="reason-help"
                  />
                  <div id="reason-help" className="sr-only">
                    Provide details about why you need this appointment
                  </div>

                  <div>
                    <label 
                      htmlFor="notes-textarea"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      id="notes-textarea"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Any additional information you'd like the doctor to know"
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
                      aria-describedby="notes-help"
                    />
                    <div id="notes-help" className="sr-only">
                      Optional additional information for the doctor
                    </div>
                  </div>

                  {errors.booking && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-red-800 dark:text-red-200 text-sm">
                        {errors.booking.message}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* AI Suggestions Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <AISuggestionPanel
              suggestions={suggestionsState.data || []}
              onApplySuggestion={handleApplySuggestion}
              isLoading={suggestionsState.isLoading}
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
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
          aria-label="Go to previous step"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center space-x-4">
          {currentStep === 'details' ? (
            <Button
              variant="primary"
              onClick={handleBookAppointment}
              disabled={!canProceedToNext() || loadingStates.booking}
              aria-label="Book appointment"
            >
              {loadingStates.booking ? 'Booking...' : 'Book Appointment'}
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
              aria-label="Go to next step"
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