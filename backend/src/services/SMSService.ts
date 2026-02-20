import twilio from 'twilio';
import { IAppointment } from '@/models/Appointment';
import { IUser } from '@/models/User';

interface SMSConfig {
  accountSid?: string;
  authToken?: string;
  phoneNumber?: string;
  frontendUrl: string;
}

export class SMSService {
  private static config: SMSConfig = {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  };

  private static client = this.config.accountSid && this.config.authToken
    ? twilio(this.config.accountSid, this.config.authToken)
    : null;

  /**
   * Send appointment confirmation SMS
   */
  static async sendAppointmentConfirmation(
    appointment: IAppointment,
    patient: IUser,
    doctor: IUser
  ): Promise<void> {
    if (!this.client) {
      console.log('Twilio not configured, skipping SMS');
      return;
    }

    if (!patient.phone) {
      console.log('Patient has no phone number, skipping SMS');
      return;
    }

    try {
      const appointmentDate = new Date(appointment.appointmentDate);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const message = `AI for Health: Your appointment is confirmed!

Date: ${formattedDate} at ${formattedTime}
Doctor: Dr. ${doctor.name}
Confirmation: ${appointment.confirmationNumber}

View details: ${this.config.frontendUrl}/appointments/${appointment._id}`;

      await this.client.messages.create({
        body: message,
        from: this.config.phoneNumber,
        to: patient.phone,
      });

      console.log(`Confirmation SMS sent to ${patient.phone}`);
    } catch (error) {
      console.error('Failed to send confirmation SMS:', error);
      throw error;
    }
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
    if (!this.client) {
      console.log('Twilio not configured, skipping SMS');
      return;
    }

    if (!patient.phone) {
      console.log('Patient has no phone number, skipping SMS');
      return;
    }

    try {
      const appointmentDate = new Date(appointment.appointmentDate);
      const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const message = `Reminder: You have an appointment in ${hoursUntil} hour${hoursUntil > 1 ? 's' : ''} at ${formattedTime}.

Doctor: Dr. ${doctor.name}
Confirmation: ${appointment.confirmationNumber}

Reply CONFIRM to confirm attendance.`;

      await this.client.messages.create({
        body: message,
        from: this.config.phoneNumber,
        to: patient.phone,
      });

      console.log(`Reminder SMS sent to ${patient.phone}`);
    } catch (error) {
      console.error('Failed to send reminder SMS:', error);
      throw error;
    }
  }

  /**
   * Send appointment cancellation notification
   */
  static async sendCancellationNotification(
    appointment: IAppointment,
    patient: IUser,
    doctor: IUser
  ): Promise<void> {
    if (!this.client || !patient.phone) {
      return;
    }

    try {
      const appointmentDate = new Date(appointment.appointmentDate);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const message = `Your appointment on ${formattedDate} at ${formattedTime} with Dr. ${doctor.name} has been cancelled.

Confirmation: ${appointment.confirmationNumber}

To book a new appointment, visit: ${this.config.frontendUrl}/appointments/book`;

      await this.client.messages.create({
        body: message,
        from: this.config.phoneNumber,
        to: patient.phone,
      });

      console.log(`Cancellation SMS sent to ${patient.phone}`);
    } catch (error) {
      console.error('Failed to send cancellation SMS:', error);
      throw error;
    }
  }

  /**
   * Send appointment rescheduled notification
   */
  static async sendRescheduleNotification(
    appointment: IAppointment,
    patient: IUser,
    doctor: IUser
  ): Promise<void> {
    if (!this.client || !patient.phone) {
      return;
    }

    try {
      const appointmentDate = new Date(appointment.appointmentDate);
      const formattedDate = appointmentDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
      const formattedTime = appointmentDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const message = `Your appointment has been rescheduled!

New Date: ${formattedDate} at ${formattedTime}
Doctor: Dr. ${doctor.name}
Confirmation: ${appointment.confirmationNumber}

View details: ${this.config.frontendUrl}/appointments/${appointment._id}`;

      await this.client.messages.create({
        body: message,
        from: this.config.phoneNumber,
        to: patient.phone,
      });

      console.log(`Reschedule SMS sent to ${patient.phone}`);
    } catch (error) {
      console.error('Failed to send reschedule SMS:', error);
      throw error;
    }
  }
}
