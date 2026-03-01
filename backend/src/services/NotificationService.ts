import { FilterQuery, Types } from 'mongoose';
import Notification, {
  INotification,
  NotificationType,
  NotificationStatus,
  NotificationChannel,
} from '../models/Notification';
import Appointment, { AppointmentStatus, IAppointment } from '../models/Appointment';
import { IUser } from '../models/User';

/* =========================================================
   Types
========================================================= */

interface CreateNotificationInput {
  user: Types.ObjectId | IUser;
  title: string;
  message: string;
  type: NotificationType;
  channel?: NotificationChannel;
  relatedEntity?: {
    kind: string;
    item: Types.ObjectId;
  };
  metadata?: Record<string, unknown>;
  scheduledFor?: Date;
}

interface PaginationOptions {
  limit?: number;
  page?: number;
  unreadOnly?: boolean;
}

interface PaginatedNotifications {
  data: INotification[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

/* =========================================================
   Helpers
========================================================= */

const extractObjectId = (value: Types.ObjectId | IUser): Types.ObjectId => {
  if (value instanceof Types.ObjectId) return value;
  return value._id as Types.ObjectId;
};

const extractDoctorName = (doctor: Types.ObjectId | IUser): string => {
  if (typeof doctor === 'object' && 'name' in doctor) {
    return doctor.name;
  }
  return 'your doctor';
};

/* =========================================================
   Service
========================================================= */

export class NotificationService {
  /* ================= CREATE ================= */

  async createNotification(data: CreateNotificationInput): Promise<INotification> {
    const notification = new Notification({
      user: extractObjectId(data.user),
      title: data.title,
      message: data.message,
      type: data.type,
      channel: data.channel ?? NotificationChannel.IN_APP,
      relatedEntity: data.relatedEntity,
      metadata: data.metadata ?? {},
      scheduledFor: data.scheduledFor ?? new Date(),
      status: NotificationStatus.PENDING,
    });

    return notification.save();
  }

  /* ================= GET USER NOTIFICATIONS ================= */

  async getUserNotifications(
    userId: Types.ObjectId | string,
    options: PaginationOptions = {}
  ): Promise<PaginatedNotifications> {
    const { limit = 20, page = 1, unreadOnly = false } = options;

    const filter: FilterQuery<INotification> = {
      user: userId,
    };

    if (unreadOnly) {
      filter.readAt = { $exists: false };
      filter.status = NotificationStatus.SENT;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Notification.countDocuments(filter),
    ]);

    return {
      data: notifications,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  }

  /* ================= MARK READ ================= */

  async markAsRead(
    notificationId: string,
    userId: Types.ObjectId | string
  ): Promise<INotification | null> {
    return Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      {
        $set: {
          readAt: new Date(),
          status: NotificationStatus.READ,
        },
      },
      { new: true }
    );
  }

  async markAllAsRead(userId: Types.ObjectId | string): Promise<{ modifiedCount: number }> {
    const result = await Notification.updateMany(
      {
        user: userId,
        readAt: { $exists: false },
        status: NotificationStatus.SENT,
      },
      {
        $set: {
          readAt: new Date(),
          status: NotificationStatus.READ,
        },
      }
    );

    return { modifiedCount: result.modifiedCount ?? 0 };
  }

  /* ================= DELETE ================= */

  async deleteNotification(
    notificationId: string,
    userId: Types.ObjectId | string
  ): Promise<boolean> {
    const result = await Notification.deleteOne({
      _id: notificationId,
      user: userId,
    });

    return (result.deletedCount ?? 0) > 0;
  }

  /* ================= APPOINTMENT NOTIFICATIONS ================= */

  async createAppointmentReminder(appointment: IAppointment): Promise<INotification | null> {
    if (appointment.appointmentDate <= new Date()) {
      return null;
    }

    const reminderDate = new Date(appointment.appointmentDate);
    reminderDate.setHours(reminderDate.getHours() - 2);

    const doctorName = extractDoctorName(appointment.doctor);

    return this.createNotification({
      user: appointment.patient,
      title: 'Upcoming Appointment Reminder',
      message: `You have an appointment with Dr. ${doctorName} at ${appointment.appointmentDate.toLocaleTimeString()}`,
      type: NotificationType.APPOINTMENT_REMINDER,
      relatedEntity: {
        kind: 'Appointment',
        item: appointment._id as Types.ObjectId,
      },
      scheduledFor: reminderDate,
      metadata: {
        appointmentDate: appointment.appointmentDate,
        doctorId:
          appointment.doctor instanceof Types.ObjectId
            ? appointment.doctor
            : appointment.doctor._id,
        appointmentType: appointment.type,
      },
    });
  }

  async createMissedAppointmentNotification(appointment: IAppointment): Promise<INotification> {
    return this.createNotification({
      user: appointment.patient,
      title: 'Missed Appointment',
      message: `You missed your appointment scheduled for ${appointment.appointmentDate.toLocaleString()}. Please reschedule.`,
      type: NotificationType.MISSED_APPOINTMENT,
      relatedEntity: {
        kind: 'Appointment',
        item: appointment._id as Types.ObjectId,
      },
      metadata: {
        appointmentDate: appointment.appointmentDate,
      },
    });
  }

  async createAppointmentConfirmation(appointment: IAppointment): Promise<INotification> {
    return this.createNotification({
      user: appointment.patient,
      title: 'Appointment Confirmed',
      message: `Your appointment has been confirmed for ${appointment.appointmentDate.toLocaleString()}`,
      type: NotificationType.APPOINTMENT_CONFIRMATION,
      relatedEntity: {
        kind: 'Appointment',
        item: appointment._id as Types.ObjectId,
      },
    });
  }

  async createAppointmentCancellation(
    appointment: IAppointment,
    reason?: string
  ): Promise<INotification> {
    return this.createNotification({
      user: appointment.patient,
      title: 'Appointment Cancelled',
      message: `Your appointment scheduled for ${appointment.appointmentDate.toLocaleString()} has been cancelled.${
        reason ? ` Reason: ${reason}` : ''
      }`,
      type: NotificationType.APPOINTMENT_CANCELLATION,
      relatedEntity: {
        kind: 'Appointment',
        item: appointment._id as Types.ObjectId,
      },
      metadata: reason ? { cancellationReason: reason } : undefined,
    });
  }

  async createAppointmentRescheduled(
    appointment: IAppointment,
    oldDate: Date
  ): Promise<INotification> {
    return this.createNotification({
      user: appointment.patient,
      title: 'Appointment Rescheduled',
      message: `Your appointment was moved from ${oldDate.toLocaleString()} to ${appointment.appointmentDate.toLocaleString()}`,
      type: NotificationType.APPOINTMENT_RESCHEDULED,
      relatedEntity: {
        kind: 'Appointment',
        item: appointment._id as Types.ObjectId,
      },
      metadata: {
        oldAppointmentDate: oldDate,
        newAppointmentDate: appointment.appointmentDate,
      },
    });
  }

  /* ================= PROCESS PENDING ================= */

  async processPendingNotifications(): Promise<{
    processed: number;
    failed: number;
  }> {
    const now = new Date();
    let processed = 0;
    let failed = 0;

    const pendingNotifications = await Notification.find({
      status: NotificationStatus.PENDING,
      $or: [{ scheduledFor: { $lte: now } }, { scheduledFor: { $exists: false } }],
    }).limit(100);

    for (const notification of pendingNotifications) {
      try {
        notification.status = NotificationStatus.SENT;
        notification.sentAt = new Date();
        await notification.save();
        processed++;
      } catch {
        notification.status = NotificationStatus.FAILED;
        await notification.save();
        failed++;
      }
    }

    return { processed, failed };
  }
}

/* =========================================================
   Default Export (Required)
========================================================= */

const notificationService = new NotificationService();
export default notificationService;
