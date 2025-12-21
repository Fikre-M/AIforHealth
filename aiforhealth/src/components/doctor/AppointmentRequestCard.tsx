import { Calendar, Clock, Mail, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import type { AppointmentRequest } from '@/types/doctor';

interface AppointmentRequestCardProps {
  request: AppointmentRequest;
  onApprove: (requestId: string) => void;
  onReject: (requestId: string) => void;
}

export function AppointmentRequestCard({ request, onApprove, onReject }: AppointmentRequestCardProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'routine': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'emergency': return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'urgent': return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default: return <Calendar className="h-4 w-4 text-green-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatSubmittedTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <Card hover className={`border-l-4 ${
      request.urgency === 'emergency' ? 'border-l-red-500' :
      request.urgency === 'urgent' ? 'border-l-orange-500' : 'border-l-green-500'
    }`}>
      <CardContent>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-medical-100 rounded-full flex items-center justify-center">
              {getUrgencyIcon(request.urgency)}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{request.patientName}</h4>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-3 w-3 mr-1" />
                {request.patientEmail}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}>
              {request.urgency}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            Requested: {formatDate(request.requestedDate)} at {request.requestedTime}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            Submitted {formatSubmittedTime(request.submittedAt)}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-700 font-medium mb-1">Reason:</p>
          <p className="text-sm text-gray-600">{request.reason}</p>
        </div>

        {request.alternativeDates.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 font-medium mb-1">Alternative dates:</p>
            <div className="flex flex-wrap gap-1">
              {request.alternativeDates.map((date, index) => (
                <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                  {formatDate(date)}
                </span>
              ))}
            </div>
          </div>
        )}

        {request.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-700 font-medium mb-1">Patient notes:</p>
            <p className="text-sm text-gray-600 italic">"{request.notes}"</p>
          </div>
        )}

        {request.status === 'pending' && (
          <div className="flex items-center space-x-2">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onApprove(request.id)}
              className="flex items-center"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReject(request.id)}
              className="flex items-center"
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {request.status === 'approved' && (
          <div className="flex items-center text-green-600 text-sm font-medium">
            <CheckCircle className="h-4 w-4 mr-1" />
            Approved - Appointment scheduled
          </div>
        )}

        {request.status === 'rejected' && (
          <div className="flex items-center text-red-600 text-sm font-medium">
            <XCircle className="h-4 w-4 mr-1" />
            Request rejected
          </div>
        )}
      </CardContent>
    </Card>
  );
}