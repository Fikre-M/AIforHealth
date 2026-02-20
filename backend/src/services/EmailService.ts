import nodemailer from 'nodemailer';
import { IAppointment } from '@/models/Appointment';
import { IUser } from '@/models/User';

interface EmailConfig {
  sendgridApiKey?: string;
  fromEmail: string;
  fromName: string;
  frontendUrl: string;
}

export class EmailService {
  private static config: EmailConfig = {
    sendgridApiKey: process.env['SENDGRID_API_KEY'],
    fromEmail: process.env['FROM_EMAIL'] || 'noreply@aiforhealth.com',
    fromName: process.env['FROM_NAME'] || 'AI for Health',
    frontendUrl: process.env['FRONTEND_URL'] || 'http://localhost:5173',
  };

  private static transporter = nodemailer.createTransport({
    host: 'smtp.sendgrid.net',
    port: 587,
    secure: false,
    auth: {
      user: 'apikey',
      pass: this.config.sendgridApiKey || 'placeholder_key',
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
    try {
      const emailHtml = this.generateConfirmationEmail(appointment, patient, doctor);
      const calendarInvite = this.generateCalendarInvite(appointment, doctor);

      await this.transporter.sendMail({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
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

      console.log(`Confirmation email sent to ${patient.email}`);
    } catch (error) {
      console.error('Failed to send confirmation email:', error);
      throw error;
    }
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
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .confirmation-number { font-size: 24px; font-weight: bold; color: #4F46E5; text-align: center; margin: 20px 0; padding: 15px; background: white; border-radius: 8px; }
          .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: bold; color: #6b7280; }
          .value { color: #111827; }
          .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .button-secondary { background: #6b7280; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          .important-box { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;">✓ Appointment Confirmed!</h1>
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
              <a href="${this.config.frontendUrl}/appointments/${appointment._id}" class="button">View Appointment</a>
              <a href="${this.config.frontendUrl}/appointments/${appointment._id}/reschedule" class="button button-secondary">Reschedule</a>
            </div>
            
            <div class="important-box">
              <strong>📋 Important Instructions:</strong>
              <ul style="margin: 10px 0;">
                <li>Please arrive 15 minutes early</li>
                <li>Bring your ID and insurance card</li>
                <li>If you need to cancel, please do so at least 24 hours in advance</li>
                <li>A calendar invite is attached to this email</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Need help? Contact us at ${this.config.fromEmail}</p>
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
CALSCALE:GREGORIAN
METHOD:REQUEST
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
  }

  /**
   * Send appointment reminder
   */
  static async sendAppointmentReminder(
    appointment: IAppointment,
    patient: IUser,
    doctor: IUser,
    hoursUntil: number
  ): Promise<void> {
    try {
      const appointmentDate = new Date(appointment.appointmentDate);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      });
      const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px;">
              <h1 style="margin: 0;">⏰ Appointment Reminder</h1>
            </div>
            
            <div style="background: #f9fafb; padding: 30px; margin-top: 20px; border-radius: 8px;">
              <p>Dear ${patient.name},</p>
              <p><strong>Your appointment is in ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}!</strong></p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Time:</strong> ${formattedTime}</p>
                <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
                <p><strong>Confirmation:</strong> ${appointment.confirmationNumber}</p>
              </div>
              
              <div style="text-align: center; margin: 20px 0;">
                <a href="${this.config.frontendUrl}/appointments/${appointment._id}" 
                   style="display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">
                  View Details
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px;">Please arrive 15 minutes early and bring your ID and insurance card.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await this.transporter.sendMail({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: patient.email,
        subject: `Reminder: Appointment in ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}`,
        html: emailHtml,
      });

      console.log(`Reminder email sent to ${patient.email}`);
    } catch (error) {
      console.error('Failed to send reminder email:', error);
      throw error;
    }
  }
}
