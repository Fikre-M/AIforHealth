# Frontend: Appointment Confirmation Implementation Guide

## Overview

The backend now returns a confirmation number when appointments are created. This guide shows how to implement the frontend confirmation page with download/print/share features.

## API Response

When creating an appointment, you'll receive:

```typescript
{
  success: true,
  data: {
    appointment: {
      _id: "675a1b2c3d4e5f6g7h8i9j0k",
      confirmationNumber: "APT-L8X9K2-A7B3C9",
      patient: { name: "John Doe", email: "john@example.com" },
      doctor: { name: "Dr. Smith", specialty: "Cardiology" },
      appointmentDate: "2024-12-25T10:00:00.000Z",
      duration: 30,
      type: "consultation",
      reason: "Regular checkup",
      status: "scheduled"
    },
    confirmationNumber: "APT-L8X9K2-A7B3C9",
    message: "Appointment created successfully. Confirmation sent to your email and phone."
  }
}
```

## Installation

```bash
npm install jspdf qrcode
npm install --save-dev @types/qrcode
```

## Implementation

### 1. Confirmation Page Component

```typescript
// src/pages/AppointmentConfirmation.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

interface Appointment {
  _id: string;
  confirmationNumber: string;
  patient: { name: string; email: string };
  doctor: { name: string; specialty?: string };
  appointmentDate: string;
  duration: number;
  type: string;
  reason: string;
  status: string;
}

export function AppointmentConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  useEffect(() => {
    // Fetch appointment details
    fetchAppointment();
  }, [id]);

  useEffect(() => {
    // Generate QR code
    if (appointment?.confirmationNumber) {
      QRCode.toDataURL(appointment.confirmationNumber, {
        width: 200,
        margin: 2,
      }).then(setQrCodeUrl);
    }
  }, [appointment]);

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/v1/appointments/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setAppointment(data.data);
    } catch (error) {
      console.error('Failed to fetch appointment:', error);
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
    doc.text(`Reason: ${appointment.reason}`, 20, y);
    
    // QR Code
    if (qrCodeUrl) {
      doc.addImage(qrCodeUrl, 'PNG', 150, 65, 40, 40);
    }
    
    // Instructions
    y += 25;
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
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Appointment Confirmation',
          text: `My appointment is confirmed! Confirmation #: ${appointment?.confirmationNumber}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Share cancelled or failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(
        `Appointment Confirmation #: ${appointment?.confirmationNumber}\n` +
        `Date: ${formatDate(appointment!.appointmentDate)}\n` +
        `Time: ${formatTime(appointment!.appointmentDate)}\n` +
        `Doctor: Dr. ${appointment!.doctor.name}`
      );
      alert('Confirmation details copied to clipboard!');
    }
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

  if (!appointment) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h1 className="text-2xl font-bold text-green-900">Appointment Confirmed!</h1>
              <p className="text-green-700 mt-1">
                Confirmation sent to your email and phone
              </p>
            </div>
          </div>
        </div>

        {/* Confirmation Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden print:shadow-none">
          {/* Header */}
          <div className="bg-indigo-600 text-white p-6 text-center">
            <h2 className="text-xl font-semibold mb-2">Confirmation Number</h2>
            <div className="text-3xl font-bold tracking-wider">
              {appointment.confirmationNumber}
            </div>
          </div>

          {/* Details */}
          <div className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Appointment Details</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Date</div>
                    <div className="font-medium">{formatDate(appointment.appointmentDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Time</div>
                    <div className="font-medium">{formatTime(appointment.appointmentDate)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Duration</div>
                    <div className="font-medium">{appointment.duration} minutes</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Type</div>
                    <div className="font-medium capitalize">{appointment.type.replace('_', ' ')}</div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Provider Information</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Doctor</div>
                    <div className="font-medium">Dr. {appointment.doctor.name}</div>
                  </div>
                  {appointment.doctor.specialty && (
                    <div>
                      <div className="text-sm text-gray-500">Specialty</div>
                      <div className="font-medium">{appointment.doctor.specialty}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-sm text-gray-500">Reason</div>
                    <div className="font-medium">{appointment.reason}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {qrCodeUrl && (
              <div className="mt-6 text-center">
                <img src={qrCodeUrl} alt="QR Code" className="mx-auto" />
                <p className="text-sm text-gray-500 mt-2">Scan at check-in</p>
              </div>
            )}

            {/* Important Instructions */}
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">📋 Important Instructions</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Please arrive 15 minutes early</li>
                <li>• Bring your ID and insurance card</li>
                <li>• Cancel at least 24 hours in advance if needed</li>
                <li>• Check in at the front desk with your confirmation number</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-gray-50 px-6 py-4 flex flex-wrap gap-3 no-print">
            <button
              onClick={downloadPDF}
              className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              📄 Download PDF
            </button>
            <button
              onClick={downloadCalendar}
              className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
            >
              📅 Add to Calendar
            </button>
            <button
              onClick={printConfirmation}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              🖨️ Print
            </button>
            <button
              onClick={shareConfirmation}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              📤 Share
            </button>
          </div>

          {/* Additional Actions */}
          <div className="px-6 py-4 border-t border-gray-200 flex gap-3 no-print">
            <button
              onClick={() => navigate('/appointments')}
              className="flex-1 text-indigo-600 hover:text-indigo-800 font-medium"
            >
              View All Appointments
            </button>
            <button
              onClick={() => navigate(`/appointments/${id}/reschedule`)}
              className="flex-1 text-gray-600 hover:text-gray-800 font-medium"
            >
              Reschedule
            </button>
          </div>
        </div>
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
```

### 2. Update Router

```typescript
// src/App.tsx or routes configuration
import { AppointmentConfirmation } from './pages/AppointmentConfirmation';

// Add route
<Route path="/appointments/:id/confirmation" element={<AppointmentConfirmation />} />
```

### 3. Redirect After Booking

```typescript
// In your appointment booking component
const handleBookAppointment = async (appointmentData) => {
  try {
    const response = await fetch('/api/v1/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(appointmentData),
    });

    const data = await response.json();
    
    if (data.success) {
      // Redirect to confirmation page
      navigate(`/appointments/${data.data.appointment._id}/confirmation`);
    }
  } catch (error) {
    console.error('Failed to book appointment:', error);
  }
};
```

## Features Implemented

### ✅ Download PDF
- Professional PDF with all appointment details
- QR code included
- Important instructions
- Formatted for printing

### ✅ Add to Calendar
- Generates .ics file
- Works with all calendar apps (Google, Outlook, Apple)
- Includes reminders (24h and 1h before)

### ✅ Print
- Print-optimized layout
- Hides action buttons when printing
- Clean, professional format

### ✅ Share
- Native share API (mobile)
- Fallback to clipboard copy (desktop)
- Shareable link

### ✅ QR Code
- Scannable at check-in
- Contains confirmation number
- Easy verification

## Styling Notes

The component uses Tailwind CSS. If you're using a different CSS framework, adjust the classes accordingly.

Key design elements:
- Indigo/purple primary color (#4F46E5)
- Green for success states
- Yellow for important notices
- Clean, modern card layout
- Responsive design (mobile-friendly)

## Testing

1. Book an appointment
2. Verify redirect to confirmation page
3. Check all details display correctly
4. Test PDF download
5. Test calendar download
6. Test print functionality
7. Test share functionality
8. Verify QR code generates
9. Test on mobile devices
10. Test print preview

## Browser Compatibility

- PDF generation: All modern browsers
- Calendar download: All browsers
- Print: All browsers
- Share API: Modern mobile browsers (fallback for desktop)
- QR Code: All browsers

## Summary

The frontend confirmation page provides a complete user experience with:
- Clear confirmation display
- Multiple download/save options
- Print functionality
- Share capability
- QR code for check-in
- Professional design

Users receive confirmations via email and SMS automatically, and can also download/print/share from the web interface.
