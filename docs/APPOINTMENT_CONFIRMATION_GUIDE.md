# Appointment Confirmation Best Practices

## Overview

When a patient books an appointment, they should receive multiple confirmation methods for reliability and convenience.

## Best Practices (Healthcare Industry Standard)

### 1. **Immediate Confirmation** ✅
- Show confirmation on screen immediately
- Display unique confirmation number
- Show all appointment details
- Provide download/print option

### 2. **Email Confirmation** ✅ (Recommended)
- Send within 1 minute of booking
- Include confirmation number
- Attach calendar invite (.ics file)
- Include cancellation/reschedule links
- PDF attachment with details

### 3. **SMS Confirmation** ✅ (Recommended)
- Send immediately after booking
- Short message with key details
- Confirmation number
- Link to view full details

### 4. **In-App Notification** ✅
- Push notification
- In-app message
- Visible in notifications tab

### 5. **Reminders** ✅
- 24 hours before appointment (email + SMS)
- 1 hour before appointment (SMS)
- Option to confirm attendance

## Implementation Guide

### Step 1: Add Confirmation Number to Model

Update `backend/src/models/Appointment.ts`:

```typescript
export interface IAppointment extends Document {
  // ... existing fields
  confirmationNumber: string;  // ADD THIS
  qrCode?: string;             // Optional: QR code for check-in
  // ... rest of fields
}

const appointmentSchema = new Schema<IAppointment>({
  // ... existing fields
  
  confirmationNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  
  qrCode: {
    type: String,
  },
  
  // ... rest of schema
});

// Pre-save hook to generate confirmation number
appointmentSchema.pre('save', function(next) {
  if (this.isNew && !this.confirmationNumber) {
    this.confirmationNumber = generateConfirmationNumber();
  }
  next();
});

// Helper function
function generateConfirmationNumber(): string {
  const prefix = 'APT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
  // Example: APT-L8X9K2-A7B3C9
}
```

### Step 2: Create Email Service

Create `backend/src/services/EmailService.ts`:

```typescript
import nodemailer from 'nodemailer';
import { env } from '@/config/env';
import { IAppointment } from '@/models/Appointment';
import { IUser } from '@/models/User';

export class EmailService {
  private static transporter = nodemailer.createTransporter({
    service: 'SendGrid', // or 'gmail', 'outlook', etc.
    auth: {
      user: 'apikey',
      pass: env.SENDGRID_API_KEY,
    },
  });

  /**
   * Send appointment confirmation email
   */
  static async sendAppointmentConfirmation(
    appointment: IAppointment,
    patient: IUser,
    doctor: IUser
  ): Promise<void> {
    const emailHtml = this.generateConfirmationEmail(appointment, patient, doctor);
    const calendarInvite = this.generateCalendarInvite(appointment, doctor);

    await this.transporter.sendMail({
      from: `${env.FROM_NAME} <${env.FROM_EMAIL}>`,
      to: patient.email,
      subject: `Appointment Confirmation - ${appointment.confirmationNumber}`,
      html: emailHtml,
      attachments: [
        {
          filename: 'appointment.ics',
          content: calendarInvite,
        },
      ],
    });
  }

  /**
   * Generate HTML email template
   */
  private static generateConfirmationEmail(
    appointment: IAppointment,
    patient: IUser,
    doctor: IUser
  ): string {
    const appointmentDate = new Date(appointment.appointmentDate);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { background: #f9fafb; padding: 30px; border-radius: 8px; margin: 20px 0; }
          .confirmation-number { font-size: 24px; font-weight: bold; color: #4F46E5; text-align: center; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #111827; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Appointment Confirmed!</h1>
          </div>
          
          <div class="content">
            <p>Dear ${patient.name},</p>
            <p>Your appointment has been successfully scheduled. Please save this confirmation for your records.</p>
            
            <div class="confirmation-number">
              Confirmation #: ${appointment.confirmationNumber}
            </div>
            
            <div class="details">
              <div class="detail-row">
                <span class="label">Date:</span>
                <span class="value">${formattedDate}</span>
              </div>
              <div class="detail-row">
                <span class="label">Time:</span>
                <span class="value">${formattedTime}</span>
              </div>
              <div class="detail-row">
                <span class="label">Duration:</span>
                <span class="value">${appointment.duration} minutes</span>
              </div>
              <div class="detail-row">
                <span class="label">Doctor:</span>
                <span class="value">Dr. ${doctor.name}</span>
              </div>
              <div class="detail-row">
                <span class="label">Type:</span>
                <span class="value">${appointment.type}</span>
              </div>
              <div class="detail-row">
                <span class="label">Reason:</span>
                <span class="value">${appointment.reason}</span>
              </div>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${env.FRONTEND_URL}/appointments/${appointment._id}" class="button">View Appointment</a>
              <a href="${env.FRONTEND_URL}/appointments/${appointment._id}/reschedule" class="button" style="background: #6b7280;">Reschedule</a>
            </div>
            
            <div style="background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <strong>Important:</strong>
              <ul>
                <li>Please arrive 15 minutes early</li>
                <li>Bring your ID and insurance card</li>
                <li>If you need to cancel, please do so at least 24 hours in advance</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Need help? Contact us at ${env.FROM_EMAIL}</p>
            <p>&copy; ${new Date().getFullYear()} AI for Health. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate calendar invite (.ics file)
   */
  private static generateCalendarInvite(
    appointment: IAppointment,
    doctor: IUser
  ): string {
    const startDate = new Date(appointment.appointmentDate);
    const endDate = new Date(startDate.getTime() + appointment.duration * 60000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//AI for Health//Appointment//EN
BEGIN:VEVENT
UID:${appointment._id}@aiforhealth.com
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:Medical Appointment with Dr. ${doctor.name}
DESCRIPTION:Appointment Type: ${appointment.type}\\nReason: ${appointment.reason}\\nConfirmation: ${appointment.confirmationNumber}
LOCATION:AI for Health Medical Center
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT24H
DESCRIPTION:Appointment Reminder
ACTION:DISPLAY
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
DESCRIPTION:Appointment in 1 hour
ACTION:DISPLAY
END:VALARM
END:VEVENT
END:VCALENDAR`;
  }
}
```

### Step 3: Create SMS Service

Create `backend/src/services/SMSService.ts`:

```typescript
import twilio from 'twilio';
import { env } from '@/config/env';
import { IAppointment } from '@/models/Appointment';
import { IUser } from '@/models/User';

export class SMSService {
  private static client = twilio(
    env.TWILIO_ACCOUNT_SID,
    env.TWILIO_AUTH_TOKEN
  );

  /**
   * Send appointment confirmation SMS
   */
  static async sendAppointmentConfirmation(
    appointment: IAppointment,
    patient: IUser,
    doctor: IUser
  ): Promise<void> {
    if (!patient.phone) {
      console.log('Patient has no phone number, skipping SMS');
      return;
    }

    const appointmentDate = new Date(appointment.appointmentDate);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const message = `
AI for Health: Your appointment is confirmed!

Date: ${formattedDate} at ${formattedTime}
Doctor: Dr. ${doctor.name}
Confirmation: ${appointment.confirmationNumber}

View details: ${env.FRONTEND_URL}/appointments/${appointment._id}
    `.trim();

    await this.client.messages.create({
      body: message,
      from: env.TWILIO_PHONE_NUMBER,
      to: patient.phone,
    });
  }

  /**
   * Send appointment reminder
   */
  static async sendAppointmentReminder(
    appointment: IAppointment,
    patient: IUser,
    hoursUntil: number
  ): Promise<void> {
    if (!patient.phone) return;

    const message = `
Reminder: You have an appointment in ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}.

Confirmation: ${appointment.confirmationNumber}
Reply CONFIRM to confirm attendance.
    `.trim();

    await this.client.messages.create({
      body: message,
      from: env.TWILIO_PHONE_NUMBER,
      to: patient.phone,
    });
  }
}
```

### Step 4: Update Appointment Controller

Update `backend/src/controllers/AppointmentController.ts`:

```typescript
import { EmailService } from '@/services/EmailService';
import { SMSService } from '@/services/SMSService';

export const createAppointment = asyncHandler(async (req, res) => {
  // ... existing validation code ...

  // Create appointment
  const appointment = await Appointment.create({
    patient: req.user.userId,
    doctor,
    appointmentDate: new Date(appointmentDate),
    duration,
    type,
    reason,
    notes,
    symptoms,
    isEmergency: isEmergency || false,
    status: AppointmentStatus.SCHEDULED,
  });

  // Populate patient and doctor details
  await appointment.populate('patient doctor');

  // Send confirmations (async, don't wait)
  Promise.all([
    EmailService.sendAppointmentConfirmation(
      appointment,
      appointment.patient as IUser,
      appointment.doctor as IUser
    ),
    SMSService.sendAppointmentConfirmation(
      appointment,
      appointment.patient as IUser,
      appointment.doctor as IUser
    ),
  ]).catch(err => {
    console.error('Failed to send confirmations:', err);
    // Don't fail the request if notifications fail
  });

  res.status(201).json({
    success: true,
    data: {
      appointment,
      confirmationNumber: appointment.confirmationNumber,
      message: 'Appointment booked successfully. Confirmation sent to your email and phone.',
    },
  });
});
```

### Step 5: Frontend - Download/Print Confirmation

Add to frontend component:

```typescript
// components/AppointmentConfirmation.tsx
import { jsPDF } from 'jspdf';
import QRCode from 'qrcode';

export function AppointmentConfirmation({ appointment }) {
  const downloadPDF = async () => {
    const doc = new jsPDF();
    
    // Add logo
    // doc.addImage(logoBase64, 'PNG', 10, 10, 50, 20);
    
    // Title
    doc.setFontSize(20);
    doc.text('Appointment Confirmation', 105, 40, { align: 'center' });
    
    // Confirmation number
    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229); // Primary color
    doc.text(`Confirmation #: ${appointment.confirmationNumber}`, 105, 55, { align: 'center' });
    
    // Details
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    let y = 75;
    
    doc.text(`Patient: ${appointment.patient.name}`, 20, y);
    y += 10;
    doc.text(`Doctor: Dr. ${appointment.doctor.name}`, 20, y);
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
    const qrCodeDataUrl = await QRCode.toDataURL(appointment.confirmationNumber);
    doc.addImage(qrCodeDataUrl, 'PNG', 150, 75, 40, 40);
    
    // Instructions
    y += 30;
    doc.setFontSize(10);
    doc.text('Important Instructions:', 20, y);
    y += 7;
    doc.text('• Please arrive 15 minutes early', 25, y);
    y += 7;
    doc.text('• Bring your ID and insurance card', 25, y);
    y += 7;
    doc.text('• Cancel at least 24 hours in advance if needed', 25, y);
    
    // Save
    doc.save(`appointment-${appointment.confirmationNumber}.pdf`);
  };

  const printConfirmation = () => {
    window.print();
  };

  const shareConfirmation = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Appointment Confirmation',
        text: `Appointment confirmed! Confirmation #: ${appointment.confirmationNumber}`,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <h1>Appointment Confirmed!</h1>
        <div className="confirmation-number">
          {appointment.confirmationNumber}
        </div>
        
        {/* Appointment details */}
        
        <div className="actions">
          <button onClick={downloadPDF}>
            Download PDF
          </button>
          <button onClick={printConfirmation}>
            Print
          </button>
          <button onClick={shareConfirmation}>
            Share
          </button>
        </div>
      </div>
    </div>
  );
}
```

## Summary of Best Practices

### ✅ Immediate (Required)
1. **On-screen confirmation** with unique number
2. **Download PDF** option
3. **Print** option

### ✅ Within 1 Minute (Highly Recommended)
1. **Email confirmation** with calendar invite
2. **SMS confirmation** with key details
3. **In-app notification**

### ✅ Reminders (Recommended)
1. **24 hours before** - Email + SMS
2. **1 hour before** - SMS
3. **Option to confirm** attendance

### ✅ Additional Features
1. **QR code** for easy check-in
2. **Add to calendar** button
3. **Reschedule/Cancel** links
4. **Share** functionality
5. **Save to phone** wallet (Apple/Google)

## Dependencies Needed

```bash
npm install nodemailer @sendgrid/mail twilio jspdf qrcode
npm install --save-dev @types/nodemailer @types/qrcode
```

## Environment Variables

Add to `.env`:
```env
# Email
SENDGRID_API_KEY=your_key_here
FROM_EMAIL=noreply@aiforhealth.com
FROM_NAME=AI for Health

# SMS
TWILIO_ACCOUNT_SID=your_sid_here
TWILIO_AUTH_TOKEN=your_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

## Testing

Test all confirmation methods:
```bash
# Test email
curl -X POST http://localhost:5000/api/v1/appointments \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "doctor": "doctor_id",
    "appointmentDate": "2024-12-25T10:00:00Z",
    "duration": 30,
    "type": "consultation",
    "reason": "Regular checkup"
  }'
```

Check:
- ✅ Email received with calendar invite
- ✅ SMS received with confirmation number
- ✅ In-app notification appears
- ✅ PDF downloads correctly
- ✅ Print works
- ✅ QR code scans correctly
