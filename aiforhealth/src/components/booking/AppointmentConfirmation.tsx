import { CheckCircle, Calendar, Clock, User, MapPin, DollarSign, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import type { BookingConfirmation } from '@/types/booking';
import { format, parseISO } from 'date-fns';

interface AppointmentConfirmationProps {
  confirmation: BookingConfirmation;
  onClose: () => void;
  onAddToCalendar?: () => void;
}

export function AppointmentConfirmation({ 
  confirmation, 
  onClose, 
  onAddToCalendar 
}: AppointmentConfirmationProps) {
  const appointmentDateTime = parseISO(`${confirmation.date}T${confirmation.time}`);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardContent>
          {/* Success Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Appointment Confirmed!
            </h2>
            <p className="text-gray-600">
              Your appointment has been successfully booked
            </p>
          </div>

          {/* Confirmation Code */}
          <div className="bg-medical-50 border border-medical-200 rounded-lg p-4 mb-6">
            <div className="text-center">
              <p className="text-sm text-medical-700 font-medium mb-1">
                Confirmation Code
              </p>
              <p className="text-2xl font-bold text-medical-800 tracking-wider">
                {confirmation.confirmationCode}
              </p>
              <p className="text-xs text-medical-600 mt-1">
                Please save this code for your records
              </p>
            </div>
          </div>

          {/* Appointment Details */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Appointment Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Doctor</p>
                    <p className="font-medium text-gray-900">{confirmation.doctorName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="font-medium text-gray-900">{confirmation.clinicName}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Type</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {confirmation.appointmentType}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-medium text-gray-900">
                      {format(appointmentDateTime, 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Time</p>
                    <p className="font-medium text-gray-900">
                      {format(appointmentDateTime, 'h:mm a')} 
                      <span className="text-sm text-gray-500 ml-1">
                        ({confirmation.estimatedDuration} min)
                      </span>
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Consultation Fee</p>
                    <p className="font-medium text-gray-900">
                      ${confirmation.consultationFee}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Reason for Visit</h4>
            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
              {confirmation.reason}
            </p>
          </div>

          {/* Instructions */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">
              Important Instructions
            </h4>
            <div className="space-y-2">
              {confirmation.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-medical-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-sm text-gray-700">{instruction}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {onAddToCalendar && (
              <Button
                variant="primary"
                onClick={onAddToCalendar}
                className="flex-1"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Add to Calendar
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Done
            </Button>
          </div>

          {/* Contact Information */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Need to reschedule or cancel? Contact the clinic directly or use your patient portal.
              <br />
              Appointment ID: {confirmation.appointmentId}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}