import { Bot, User, AlertTriangle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { ChatMessage as ChatMessageType } from '@/types/symptomChecker';
import { format, parseISO } from 'date-fns';

interface ChatMessageProps {
  message: ChatMessageType;
  onBookAppointment?: () => void;
}

export function ChatMessage({ message, onBookAppointment }: ChatMessageProps) {
  const isUser = message.sender === 'user';
  const timestamp = format(parseISO(message.timestamp), 'h:mm a');

  const getMessageIcon = () => {
    if (isUser) return <User className="h-4 w-4" />;
    
    switch (message.type) {
      case 'disclaimer':
        return <AlertTriangle className="h-4 w-4" />;
      case 'appointment-prompt':
        return <Calendar className="h-4 w-4" />;
      default:
        return <Bot className="h-4 w-4" />;
    }
  };

  const getMessageStyle = () => {
    if (isUser) {
      return 'bg-medical-600 text-white ml-12';
    }
    
    switch (message.type) {
      case 'disclaimer':
        return 'bg-yellow-50 border border-yellow-200 text-yellow-800 mr-12';
      case 'appointment-prompt':
        return 'bg-blue-50 border border-blue-200 text-blue-800 mr-12';
      default:
        return 'bg-gray-100 text-gray-900 mr-12';
    }
  };

  const getIconStyle = () => {
    if (isUser) {
      return 'bg-medical-600 text-white';
    }
    
    switch (message.type) {
      case 'disclaimer':
        return 'bg-yellow-100 text-yellow-600';
      case 'appointment-prompt':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-200 text-gray-600';
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`flex items-start space-x-2 sm:space-x-3 max-w-full sm:max-w-3xl ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`p-2 rounded-full flex-shrink-0 ${getIconStyle()}`}>
          {getMessageIcon()}
        </div>
        
        <div className={`rounded-lg p-3 sm:p-4 min-w-0 flex-1 ${getMessageStyle()}`}>
          <div className="prose prose-sm max-w-none">
            {message.type === 'disclaimer' ? (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 flex-shrink-0" />
                  <span className="font-semibold text-yellow-800 text-sm sm:text-base">Medical Disclaimer</span>
                </div>
                <p className="text-xs sm:text-sm text-yellow-700">
                  {message.content.replace('⚠️ **Important Medical Disclaimer**: ', '')}
                </p>
              </div>
            ) : (
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
          
          {/* Metadata Display */}
          {message.metadata && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              {message.metadata.severity && (
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                  <span className="text-xs font-medium text-gray-600">Severity:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block ${
                    message.metadata.severity === 'severe' ? 'bg-red-100 text-red-800' :
                    message.metadata.severity === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {message.metadata.severity}
                  </span>
                </div>
              )}
              
              {message.metadata.suggestedSpecialty && (
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mb-2">
                  <span className="text-xs font-medium text-gray-600">Suggested Specialty:</span>
                  <span className="text-xs text-medical-600 font-medium">
                    {message.metadata.suggestedSpecialty}
                  </span>
                </div>
              )}
              
              {message.metadata.confidence && (
                <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                  <span className="text-xs font-medium text-gray-600">Confidence:</span>
                  <span className="text-xs text-gray-700">
                    {Math.round(message.metadata.confidence * 100)}%
                  </span>
                </div>
              )}
            </div>
          )}
          
          {/* Appointment Booking Button */}
          {message.type === 'appointment-prompt' && onBookAppointment && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <Button
                variant="primary"
                size="sm"
                onClick={onBookAppointment}
                className="w-full"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Book Appointment
              </Button>
            </div>
          )}
          
          <div className="mt-2 text-xs text-gray-500">
            {timestamp}
          </div>
        </div>
      </div>
    </div>
  );
}