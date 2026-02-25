import { 
  Calendar, 
  AlertTriangle, 
  Clock, 
  Pill, 
  Heart, 
  Settings, 
  X,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Notification } from '@/types/notification';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (url: string) => void;
  compact?: boolean;
}

export function NotificationItem({ 
  notification, 
  onMarkAsRead, 
  onDelete, 
  onAction,
  compact = false 
}: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'appointment-reminder':
        return <Calendar className="h-5 w-5" />;
      case 'missed-appointment':
        return <AlertTriangle className="h-5 w-5" />;
      case 'follow-up':
        return <Clock className="h-5 w-5" />;
      case 'medication':
        return <Pill className="h-5 w-5" />;
      case 'health-tip':
        return <Heart className="h-5 w-5" />;
      case 'system':
        return <Settings className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getIconColor = () => {
    switch (notification.type) {
      case 'appointment-reminder':
        return 'text-blue-600 bg-blue-100';
      case 'missed-appointment':
        return 'text-red-600 bg-red-100';
      case 'follow-up':
        return 'text-yellow-600 bg-yellow-100';
      case 'medication':
        return 'text-green-600 bg-green-100';
      case 'health-tip':
        return 'text-pink-600 bg-pink-100';
      case 'system':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-medical-600 bg-medical-100';
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'urgent':
        return 'border-l-red-500';
      case 'high':
        return 'border-l-orange-500';
      case 'medium':
        return 'border-l-yellow-500';
      case 'low':
        return 'border-l-green-500';
      default:
        return 'border-l-gray-300';
    }
  };

  const handleAction = () => {
    if (notification.actionUrl && onAction) {
      onAction(notification.actionUrl);
    }
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    onMarkAsRead(notification.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  const timestamp = parseISO(notification.timestamp);
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });

  return (
    <div
      className={`border-l-4 ${getPriorityColor()} bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow ${
        !notification.read ? 'bg-blue-50' : ''
      }`}
    >
      <div className="flex items-start space-x-2 sm:space-x-3">
        <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${getIconColor()}`}>
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-1">
                <h4 className={`font-semibold text-sm sm:text-base text-gray-900 truncate`}>
                  {notification.title}
                </h4>
                <div className="flex items-center space-x-2">
                  {!notification.read && (
                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
                  )}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                    notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {notification.priority}
                  </span>
                </div>
              </div>
              
              <p className={`text-gray-700 mb-2 text-sm break-words`}>
                {notification.message}
              </p>
              
              {notification.metadata && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {notification.metadata.doctorName && (
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {notification.metadata.doctorName}
                    </span>
                  )}
                  {notification.metadata.appointmentDate && notification.metadata.appointmentTime && (
                    <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {format(parseISO(notification.metadata.appointmentDate), 'MMM d')} at {notification.metadata.appointmentTime}
                    </span>
                  )}
                  {notification.metadata.daysUntilAppointment !== undefined && (
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      {notification.metadata.daysUntilAppointment === 0 ? 'Today' :
                       notification.metadata.daysUntilAppointment === 1 ? 'Tomorrow' :
                       `In ${notification.metadata.daysUntilAppointment} days`}
                    </span>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className={`text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
                  {timeAgo}
                </span>
                
                <div className="flex items-center space-x-2">
                  {notification.actionUrl && notification.actionLabel && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAction}
                      className="text-xs"
                    >
                      {notification.actionLabel}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  )}
                  
                  {!notification.read && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleMarkAsRead}
                      className="text-xs"
                    >
                      Mark as read
                    </Button>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}