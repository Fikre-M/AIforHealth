import { Clock, User, MapPin, Video, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import type { DoctorAppointment } from '@/types/doctor';

interface AppointmentCardProps {
  appointment: DoctorAppointment;
  onStatusChange: (appointmentId: string, status: DoctorAppointment['status']) => void;
}

export function AppointmentCard({ appointment, onStatusChange }: AppointmentCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no-show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'emergency': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'surgery': return <AlertCircle className="h-4 w-4 text-purple-600" />;
      default: return <User className="h-4 w-4 text-medical-600" />;
    }
  };

  return (
    <Card hover className="border-l-4 border-l-medical-500">
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-medical-100 rounded-full flex items-center justify-center">
              {getTypeIcon(appointment.type)}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{appointment.patientName}</h4>
              <p className="text-sm text-gray-600 capitalize">{appointment.type}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(appointment.priority)}`}>
              {appointment.priority}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment.status)}`}>
              {appointment.status}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            {appointment.time} ({appointment.duration} min)
          </div>
          <div className="flex items-center text-sm text-gray-600">
            {appointment.isVirtual ? (
              <>
                <Video className="h-4 w-4 mr-2" />
                Virtual Appointment
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                {appointment.location}
              </>
            )}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-700 font-medium mb-1">Reason:</p>
          <p className="text-sm text-gray-600">{appointment.reason}</p>
        </div>

        {appointment.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 font-medium mb-1">Notes:</p>
            <p className="text-sm text-gray-600">{appointment.notes}</p>
          </div>
        )}

        <div className="flex items-center space-x-2">
          {appointment.status === 'scheduled' && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => onStatusChange(appointment.id, 'in-progress')}
              >
                Start
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(appointment.id, 'cancelled')}
              >
                Cancel
              </Button>
            </>
          )}
          {appointment.status === 'in-progress' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onStatusChange(appointment.id, 'completed')}
            >
              Complete
            </Button>
          )}
          {appointment.status === 'completed' && (
            <span className="text-sm text-green-600 font-medium">✓ Completed</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}