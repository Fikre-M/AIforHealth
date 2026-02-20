import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';
import { Calendar, Download, Printer, Share2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import apiAdapter from '@/services/apiAdapter';

interface AppointmentData {
  _id: string;
  confirmationNumber: string;
  patient: { name: string; email: string; phone?: string };
  doctor: { name: string; email: string; specialty?: string };
  appointmentDate: string;
  duration: number;
  type: string;
  reason: string;
  status: string;
}

export function AppointmentConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<AppointmentData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointment();
  }, [id]);

  useEffect(() => {
    if (appointment?.confirmationNumber) {
      QRCode.toDataURL(appointment.confirmationNumber, {
        width: 200,
        margin: 2,
        color: {
          dark: '#4F46E5',
          light: '#FFFFFF'
        }
      }).then(setQrCodeUrl).catch(console.error);
    }
  }, [appointment]);

  const fetchAppointment = async () => {
    if (!id) {
      setError('No appointment ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await apiAdapter.appointments.getAppointment(id);
      setAppointment(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch appointment:', err);
      setError('Failed to load appointment details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const downloadPDF = async () => {
    if (!appointment) return;

    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(24);
    doc.setTextColor(79, 70, 229);
    doc.text('Appointment Confirmation', 105, 30, { align: 'center' });
    
    // Confirmation number
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text(`Confirmation #: ${appointment.confirmationNumber}`, 105, 45, { align: 'center' });
    
    // Details
    doc.setFontSize(12);
    let y = 65;
    
    doc.text(`Patient: ${appointment.patient.name}`, 20, y);
    y += 10;
    doc.text(`Doctor: Dr. ${appointment.doctor.name}`, 20, y);
    if (appointment.doctor.specialty) {
      y += 7;
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Specialty: ${appointment.doctor.specialty}`, 25, y);
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
    }
    y += 10;
    doc.text(`Date: ${formatDate(appointment.appointmentDate)}`, 20, y);
    y += 10;
    doc.text(`Time: ${formatTime(appointment.appointmentDate)}`, 20, y);
    y += 10;
    doc.text(`Duration: ${appointment.duration} minutes`, 20, y);
    y += 10;
    doc.text(`Type: ${appointment.type}`, 20, y);
    y += 10;
    
    // Wrap reason text
    const reasonLines = doc.splitTextToSize(`Reason: ${appointment.reason}`, 170);
    doc.text(reasonLines, 20, y);
    y += reasonLines.length * 7;
    
    // QR Code
    if (qrCodeUrl) {
      doc.addImage(qrCodeUrl, 'PNG', 150, 65, 40, 40);
    }
    
    // Instructions
    y += 15;
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229);
    doc.text('Important Instructions:', 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text('• Please arrive 15 minutes early', 25, y);
    y += 7;
    doc.text('• Bring your ID and insurance card', 25, y);
    y += 7;
    doc.text('• Cancel at least 24 hours in advance if needed', 25, y);
    y += 7;
    doc.text('• Check in at the front desk with your confirmation number', 25, y);
    
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('AI for Health - Your Healthcare Partner', 105, 280, { align: 'center' });
    
    // Save
    doc.save(`appointment-${appointment.confirmationNumber}.pdf`);
  };

  const printConfirmation = () => {
    window.print();
  };

  const shareConfirmation = async () => {
    if (!appointment) return;

    const shareData = {
      title: 'Appointment Confirmation',
      text: `My appointment is confirmed! Confirmation #: ${appointment.confirmationNumber}\nDate: ${formatDate(appointment.appointmentDate)}\nTime: ${formatTime(appointment.appointmentDate)}\nDoctor: Dr. ${appointment.doctor.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.log('Share cancelled or failed:', error);
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    if (!appointment) return;

    const text = `Appointment Confirmation #: ${appointment.confirmationNumber}\nDate: ${formatDate(appointment.appointmentDate)}\nTime: ${formatTime(appointment.appointmentDate)}\nDoctor: Dr. ${appointment.doctor.name}`;
    
    navigator.clipboard.writeText(text).then(() => {
      alert('Confirmation details copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy:', err);
    });
  };

  const downloadCalendar = () => {
    if (!appointment) return;

    const startDate = new Date(appointment.appointmentDate);
    const endDate = new Date(startDate.getTime() + appointment.duration * 60000);
    
    const formatICSDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AI for Health//Appointment//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${appointment._id}@aiforhealth.com
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:Medical Appointment with Dr. ${appointment.doctor.name}
DESCRIPTION:Appointment Type: ${appointment.type}\\nReason: ${appointment.reason}\\nConfirmation: ${appointment.confirmationNumber}
LOCATION:AI for Health Medical Center
STATUS:CONFIRMED
SEQUENCE:0
TRANSP:OPAQUE
BEGIN:VALARM
TRIGGER:-PT24H
DESCRIPTION:Appointment Reminder - Tomorrow
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
DESCRIPTION:Appointment in 1 hour
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointment-${appointment.confirmationNumber}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="text-center py-12">
            <p className="text-red-600 mb-4">{error || 'Appointment not found'}</p>
            <Button onClick={() => navigate('/app/appointments')}>
              Go to Appointments
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/app/appointments')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 no-print"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Appointments
        </button>

        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3 flex-shrink-0" />
            <div>
              <h1 className="text-2xl font-bold text-green-900">Appointment Confirmed!</h1>
              <p className="text-green-700 mt-1">
                Confirmation sent to your email{appointment.patient.phone && ' and phone'}
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Card */}
        <Card className="shadow-lg print:shadow-none">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-6 text-center rounded-t-lg">
            <h2 className="text-xl font-semibold mb-2">Confirmation Number</h2>
            <div className="text-3xl font-bold tracking-wider">
              {appointment.confirmationNumber}
            </div>
          </div>

          <CardContent className="p-6">
            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Appointment Details</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="font-medium text-gray-900">{formatDate(appointment.appointmentDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Time</div>
                    <div className="font-medium text-gray-900">{formatTime(appointment.appointmentDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-medium text-gray-900">{appointment.duration} minutes</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Type</div>
                    <div className="font-medium text-gray-900 capitalize">{appointment.type.replace('_', ' ')}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Provider Information</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Doctor</div>
                    <div className="font-medium text-gray-900">Dr. {appointment.doctor.name}</div>
                  </div>
                  {appointment.doctor.specialty && (
                    <div>
                      <div className="text-sm text-gray-500">Specialty</div>
                      <div className="font-medium text-gray-900">{appointment.doctor.specialty}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-500">Reason</div>
                    <div className="font-medium text-gray-900">{appointment.reason}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {qrCodeUrl && (
              <div className="mb-6 text-center">
                <img src={qrCodeUrl} alt="QR Code" className="mx-auto w-48 h-48" />
                <p className="text-sm text-gray-500 mt-2">Scan at check-in</p>
              </div>
            )}

            {/* Important Instructions */}
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">📋 Important Instructions</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Please arrive 15 minutes early</li>
                <li>• Bring your ID and insurance card</li>
                <li>• If you need to cancel, please do so at least 24 hours in advance</li>
                <li>• Check in at the front desk with your confirmation number</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 no-print">
              <Button
                onClick={downloadPDF}
                variant="primary"
                className="flex items-center justify-center"
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                onClick={downloadCalendar}
                variant="primary"
                className="flex items-center justify-center"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </Button>
              <Button
                onClick={printConfirmation}
                variant="outline"
                className="flex items-center justify-center"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button
                onClick={shareConfirmation}
                variant="outline"
                className="flex items-center justify-center"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            {/* Additional Actions */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row gap-3 no-print">
              <Button
                onClick={() => navigate('/app/appointments')}
                variant="outline"
                className="flex-1"
              >
                View All Appointments
              </Button>
              <Button
                onClick={() => navigate(`/app/appointments/${id}/reschedule`)}
                variant="outline"
                className="flex-1"
              >
                Reschedule
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
          .shadow-lg {
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}
