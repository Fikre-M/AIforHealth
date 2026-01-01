import { Types } from 'mongoose';
import Notification, { INotification, NotificationType, NotificationStatus, NotificationChannel } from '../models/Notification';
import Appointment, { AppointmentStatus, IAppointment } from '../models/Appointment';
import { IUser } from '../models/User';

class NotificationService {
  /**
   * Create a notification
   */
  async createNotification(data: {
    user: Types.ObjectId | IUser;
    title: string;
    message: string;
    type: NotificationType;
    channel?: NotificationChannel;
    relatedEntity?: {
      kind: string;
      item: Types.ObjectId;
    };
    metadata?: Record<string, any>;
    scheduledFor?: Date;
  }): Promise<INotification> {
    const notification = new Notification({
      user: data.user,
      title: data.title,
      message: data.message,
      type: data.type,
      channel: data.channel || NotificationChannel.IN_APP,
      relatedEntity: data.relatedEntity,
      metadata: data.metadata || {},
      scheduledFor: data.scheduledFor || new Date(),
      status: NotificationStatus.PENDING
    });

    return notification.save();
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: Types.ObjectId | string,
    { limit = 20, page = 1, unreadOnly = false }: { limit?: number; page?: number; unreadOnly?: boolean } = {}
  ) {
    const query: any = { user: userId };
    
    if (unreadOnly) {
      query.readAt = { $exists: false };
      query.status = NotificationStatus.SENT;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query)
    ]);

    return {
      data: notifications,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit
      }
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: Types.ObjectId | string): Promise<INotification | null> {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { 
        $set: { 
          readAt: new Date(),
          status: NotificationStatus.READ 
        } 
      },
      { new: true }
    );

    return notification;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: Types.ObjectId | string): Promise<{ modifiedCount: number }> {
    const result = await Notification.updateMany(
      { 
        user: userId, 
        readAt: { $exists: false },
        status: NotificationStatus.SENT
      },
      { 
        $set: { 
          readAt: new Date(),
          status: NotificationStatus.READ 
        } 
      }
    );

    return { modifiedCount: result.modifiedCount || 0 };
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string, userId: Types.ObjectId | string): Promise<boolean> {
    const result = await Notification.deleteOne({ _id: notificationId, user: userId });
    return result.deletedCount > 0;
  }

  // ==================== APPOINTMENT-RELATED NOTIFICATIONS ====================

  /**
   * Create appointment reminder notification
   */
  async createAppointmentReminder(appointment: IAppointment): Promise<INotification | null> {
    // Only create reminder for upcoming appointments
    if (appointment.appointmentDate <= new Date()) {
      return null;
    }

    const reminderDate = new Date(appointment.appointmentDate);
    reminderDate.setHours(reminderDate.getHours() - 2); // 2 hours before appointment

    return this.createNotification({
      user: appointment.patient,
      title: 'Upcoming Appointment Reminder',
      message: `You have an appointment with Dr. ${(appointment as any).doctor?.name || 'your doctor'} at ${appointment.appointmentDate.toLocaleTimeString()}`,
      type: NotificationType.APPOINTMENT_REMINDER,
      relatedEntity: {
        kind: 'Appointment',
        item: appointment._id
      },
      scheduledFor: reminderDate,
      metadata: {
        appointmentDate: appointment.appointmentDate,
        doctorId: appointment.doctor,
        appointmentType: appointment.type
      }
    });
  }

  /**
   * Create missed appointment notification
   */
  async createMissedAppointmentNotification(appointment: IAppointment): Promise<INotification> {
    return this.createNotification({
      user: appointment.patient,
      title: 'Missed Appointment',
      message: `You missed your appointment scheduled for ${appointment.appointmentDate.toLocaleString()}. Please reschedule.`,
      type: NotificationType.MISSED_APPOINTMENT,
      relatedEntity: {
        kind: 'Appointment',
        item: appointment._id
      },
      metadata: {
        appointmentDate: appointment.appointmentDate,
        doctorId: appointment.doctor
      }
    });
  }

  /**
   * Create appointment confirmation notification
   */
  async createAppointmentConfirmation(appointment: IAppointment): Promise<INotification> {
    return this.createNotification({
      user: appointment.patient,
      title: 'Appointment Confirmed',
      message: `Your appointment with Dr. ${(appointment as any).doctor?.name || 'your doctor'} has been confirmed for ${appointment.appointmentDate.toLocaleString()}`,
      type: NotificationType.APPOINTMENT_CONFIRMATION,
      relatedEntity: {
        kind: 'Appointment',
        item: appointment._id
      },
      metadata: {
        appointmentDate: appointment.appointmentDate,
        doctorId: appointment.doctor,
        appointmentType: appointment.type
      }
    });
  }

  /**
   * Create appointment cancellation notification
   */
  async createAppointmentCancellation(appointment: IAppointment, reason?: string): Promise<INotification> {
    return this.createNotification({
      user: appointment.patient,
      title: 'Appointment Cancelled',
      message: `Your appointment scheduled for ${appointment.appointmentDate.toLocaleString()} has been cancelled.${reason ? ` Reason: ${reason}` : ''}`,
      type: NotificationType.APPOINTMENT_CANCELLATION,
      relatedEntity: {
        kind: 'Appointment',
        item: appointment._id
      },
      metadata: {
        appointmentDate: appointment.appointmentDate,
        doctorId: appointment.doctor,
        cancellationReason: reason
      }
    });
  }

  /**
   * Create appointment rescheduled notification
   */
  async createAppointmentRescheduled(appointment: IAppointment, oldDate: Date): Promise<INotification> {
    return this.createNotification({
      user: appointment.patient,
      title: 'Appointment Rescheduled',
      message: `Your appointment has been rescheduled from ${oldDate.toLocaleString()} to ${appointment.appointmentDate.toLocaleString()}`,
      type: NotificationType.APPOINTMENT_RESCHEDULED,
      relatedEntity: {
        kind: 'Appointment',
        item: appointment._id
      },
      metadata: {
        oldAppointmentDate: oldDate,
        newAppointmentDate: appointment.appointmentDate,
        doctorId: appointment.doctor
      }
    });
  }

  /**
   * Process pending notifications (to be called by a scheduled job)
   */
  async processPendingNotifications(): Promise<{ processed: number; failed: number }> {
    const now = new Date();
    let processed = 0;
    let failed = 0;

    // Find all pending notifications that are scheduled for now or before
    const pendingNotifications = await Notification.find({
      status: NotificationStatus.PENDING,
      $or: [
        { scheduledFor: { $lte: now } },
        { scheduledFor: { $exists: false } }
      ]
    }).limit(100); // Process in batches of 100

    for (const notification of pendingNotifications) {
      try {
        // In a real implementation, this is where you would send the notification
        // via the appropriate channel (email, SMS, push, etc.)
        // For now, we'll just mark it as sent
        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date();
        await notification.save();
        processed++;
      } catch (error) {
        console.error(`Failed to process notification ${notification._id}:`, error);
        notification.status = NotificationStatus.FAILED;
        await notification.save();
        failed++;
      }
    }

    return { processed, failed };
  }

  /**
   * Check for upcoming appointments and create reminders
   */
  async checkForUpcomingAppointments(): Promise<{ remindersCreated: number }> {
    const now = new Date();
    const reminderWindow = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

    // Find appointments that are within the reminder window and don't have a reminder sent yet
    const appointments = await Appointment.find({
      appointmentDate: {
        $gt: now,
        $lte: reminderWindow
      },
      reminderSent: { $ne: true },
      status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] }
    }).populate('patient doctor', 'name email');

    let remindersCreated = 0;

    for (const appointment of appointments) {
      try {
        await this.createAppointmentReminder(appointment);
        appointment.reminderSent = true;
        await appointment.save();
        remindersCreated++;
      } catch (error) {
        console.error(`Failed to create reminder for appointment ${appointment._id}:`, error);
      }
    }

    return { remindersCreated };
  }

  /**
   * Check for missed appointments and create notifications
   */
  async checkForMissedAppointments(): Promise<{ notificationsCreated: number }> {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 24 * 60 * 60 * 1000); // Last 24 hours

    // Find appointments that were scheduled in the past 24 hours and were not completed
    const appointments = await Appointment.find({
      appointmentDate: {
        $gte: windowStart,
        $lt: now
      },
      status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] }
    }).populate('patient doctor', 'name email');

    let notificationsCreated = 0;

    for (const appointment of appointments) {
      try {
        // Check if a notification was already created for this missed appointment
        const existingNotification = await Notification.findOne({
          'relatedEntity.kind': 'Appointment',
          'relatedEntity.item': appointment._id,
          type: NotificationType.MISSED_APPOINTMENT
        });

        if (!existingNotification) {
          await this.createMissedAppointmentNotification(appointment);
          appointment.status = AppointmentStatus.MISSED;
          await appointment.save();
          notificationsCreated++;
        }
      } catch (error) {
        console.error(`Failed to create missed appointment notification for appointment ${appointment._id}:`, error);
      }
    }

    return { notificationsCreated };
  }
}

export default new NotificationService();
