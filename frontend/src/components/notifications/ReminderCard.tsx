import { Calendar, Clock, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import type { Notification } from '@/types/notification';
import { format, parseISO } from 'date-fns';

interface ReminderCardProps {
  notification: Notification;
  onDismiss: (id: string) => void;
  onAction: (url: string) => void;
  onSnooze?: (id: string, minutes: number) => void;
}

export function ReminderCard({ notification, onDismiss, onAction, onSnooze }: ReminderCardProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'appointment-reminder':
        return <Calendar className="h-6 w-6" />;
      case 'missed-appointment':
        return <AlertTriangle className="h-6 w-6" />;
      case 'follow-up':
        return <Clock className="h-6 w-6" />;
      default:
        return <Calendar className="h-6 w-6" />;
    }
  };

  const getCardStyle = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'border-l-4 border-l-red-500 bg-red-50';
      case 'high':
        return 'border-l-4 border-l-orange-500 bg-orange-50';
      case 'medium':
        return 'border-l-4 border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-4 border-l-medical-500 bg-medical-50';
    }
  };

  const getIconStyle = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'text-red-600 bg-red-100';
      case 'high':
        return 'text-orange-600 bg-orange-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-medical-600 bg-medical-100';
    }
  };

  const handleAction = () => {
    if (notification.actionUrl) {
      onAction(notification.actionUrl);
    }
  };

  const handleSnooze = (minutes: number) => {
    if (onSnooze) {
      onSnooze(notification.id, minutes);
    }
  };

  return (
    <Card className={`${getCardStyle()} shadow-md`}>
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className={`p-3 rounded-lg ${getIconStyle()}`}>
              {getIcon()}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                  notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                  notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {notification.priority}
                </span>
              </div>
              
              <p className="text-gray-700 mb-3">{notification.message}</p>
              
              {notification.metadata && (
                <div className="space-y-1 mb-4">
                  {notification.metadata.doctorName && (
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Doctor:</span>
                      <span className="ml-2">{notification.metadata.doctorName}</span>
                    </div>
                  )}
                  {notification.metadata.appointmentDate && notification.metadata.appointmentTime && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        {format(parseISO(notification.metadata.appointmentDate), 'EEEE, MMMM d, yyyy')} at {notification.metadata.appointmentTime}
                      </span>
                    </div>
                  )}
                  {notification.metadata.daysUntilAppointment !== undefined && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>
                        {notification.metadata.daysUntilAppointment === 0 ? 'Today' :
                         notification.metadata.daysUntilAppointment === 1 ? 'Tomorrow' :
                         `In ${notification.metadata.daysUntilAppointment} days`}
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center space-x-2">
                {notification.actionUrl && notification.actionLabel && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAction}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    {notification.actionLabel}
                  </Button>
                )}
                
                {onSnooze && notification.type === 'appointment-reminder' && (
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSnooze(15)}
                    >
                      Snooze 15m
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSnooze(60)}
                    >
                      Snooze 1h
                    </Button>
                  </div>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(notification.id)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDismiss(notification.id)}
            className="text-gray-400 hover:text-gray-600 p-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}