import nodemailer, { Transporter } from 'nodemailer';
import { IAppointment } from '@/models/Appointment';
import { IUser } from '@/models/User';
import { AppError } from '@/middleware/errorHandler';

/* =========================================================
   Interfaces
========================================================= */

interface EmailConfig {
  sendgridApiKey?: string;
  fromEmail: string;
  fromName: string;
  frontendUrl: string;
}

/* =========================================================
   Service
========================================================= */

export class EmailService {
  private static config: EmailConfig = {
    sendgridApiKey: process.env['SENDGRID_API_KEY'],
    fromEmail: process.env['FROM_EMAIL'] ?? 'noreply@aiforhealth.com',
    fromName: process.env['FROM_NAME'] ?? 'AI for Health',
    frontendUrl: process.env['FRONTEND_URL'] ?? 'http://localhost:5173',
  };

  private static transporter: Transporter | null = null;

  /* =========================================================
     Internal: Create Transporter Lazily
  ========================================================= */

  private static getTransporter(): Transporter {
    if (!this.config.sendgridApiKey) {
      throw new AppError('Email service not configured', 500);
    }

    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
          user: 'apikey',
          pass: this.config.sendgridApiKey,
        },
      });
    }

    return this.transporter;
  }

  /* =========================================================
     Public Methods
  ========================================================= */

  static async sendWelcomeEmail(user: IUser): Promise<void> {
    try {
      const transporter = this.getTransporter();

      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to ${this.config.fromName} 🎉</h2>
          <p>Hi ${user.name},</p>
          <p>Your account has been successfully created.</p>
          <p>You can now book appointments and manage your health online.</p>
          <a href="${this.config.frontendUrl}/dashboard"
             style="display:inline-block;padding:10px 20px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;">
            Go to Dashboard
          </a>
        </div>
      `;

      await transporter.sendMail({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: user.email,
        subject: 'Welcome to AI for Health',
        html,
      });
    } catch (error: unknown) {
      throw this.handleEmailError(error);
    }
  }

  static async sendPasswordResetEmail(user: IUser, resetToken: string): Promise<void> {
    try {
      const transporter = this.getTransporter();

      const resetUrl = `${this.config.frontendUrl}/reset-password/${resetToken}`;

      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your password.</p>
          <a href="${resetUrl}"
             style="display:inline-block;padding:10px 20px;background:#DC2626;color:#fff;text-decoration:none;border-radius:6px;">
            Reset Password
          </a>
          <p style="margin-top:20px;font-size:14px;color:#6b7280;">
            If you did not request this, please ignore this email.
          </p>
        </div>
      `;

      await transporter.sendMail({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: user.email,
        subject: 'Password Reset Instructions',
        html,
      });
    } catch (error: unknown) {
      throw this.handleEmailError(error);
    }
  }

  static async sendAppointmentConfirmation(
    appointment: IAppointment,
    patient: IUser,
    doctor: IUser
  ): Promise<void> {
    try {
      const transporter = this.getTransporter();

      const emailHtml = this.generateConfirmationEmail(appointment, patient, doctor);

      const calendarInvite = this.generateCalendarInvite(appointment, doctor);

      await transporter.sendMail({
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
    } catch (error: unknown) {
      throw this.handleEmailError(error);
    }
  }

  static async sendAppointmentReminder(
    appointment: IAppointment,
    patient: IUser,
    doctor: IUser,
    hoursUntil: number
  ): Promise<void> {
    try {
      const transporter = this.getTransporter();

      const appointmentDate = new Date(appointment.appointmentDate);

      const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>⏰ Appointment Reminder</h2>
          <p>Hi ${patient.name},</p>
          <p>Your appointment is in <strong>${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}</strong>.</p>
          <p><strong>Date:</strong> ${appointmentDate.toLocaleString()}</p>
          <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
          <a href="${this.config.frontendUrl}/appointments/${appointment._id}"
             style="display:inline-block;padding:10px 20px;background:#4F46E5;color:#fff;text-decoration:none;border-radius:6px;">
            View Appointment
          </a>
        </div>
      `;

      await transporter.sendMail({
        from: `${this.config.fromName} <${this.config.fromEmail}>`,
        to: patient.email,
        subject: `Reminder: Appointment in ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''}`,
        html,
      });
    } catch (error: unknown) {
      throw this.handleEmailError(error);
    }
  }

  /* =========================================================
     Private Helpers
  ========================================================= */

  private static handleEmailError(error: unknown): AppError {
    if (error instanceof Error) {
      return new AppError(`Email sending failed: ${error.message}`, 500);
    }
    return new AppError('Email sending failed', 500);
  }

  private static generateConfirmationEmail(
    appointment: IAppointment,
    patient: IUser,
    doctor: IUser
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Appointment Confirmed ✅</h2>
        <p>Hi ${patient.name},</p>
        <p>Your appointment has been scheduled.</p>
        <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
        <p><strong>Confirmation:</strong> ${appointment.confirmationNumber}</p>
      </div>
    `;
  }

  private static generateCalendarInvite(appointment: IAppointment, doctor: IUser): string {
    const startDate = new Date(appointment.appointmentDate);
    const endDate = new Date(startDate.getTime() + appointment.duration * 60000);

    const formatDate = (date: Date): string =>
      date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
UID:${appointment._id}
DTSTAMP:${formatDate(new Date())}
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:Appointment with Dr. ${doctor.name}
END:VEVENT
END:VCALENDAR`;
  }
}
