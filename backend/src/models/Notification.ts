import mongoose, { Document, Schema, Types } from 'mongoose';

export enum NotificationType {
  APPOINTMENT_REMINDER = 'appointment_reminder',
  APPOINTMENT_CONFIRMATION = 'appointment_confirmation',
  APPOINTMENT_CANCELLATION = 'appointment_cancellation',
  APPOINTMENT_RESCHEDULED = 'appointment_rescheduled',
  MISSED_APPOINTMENT = 'missed_appointment',
  DOCTOR_ASSIGNED = 'doctor_assigned',
  PRESCRIPTION_READY = 'prescription_ready',
  TEST_RESULTS_READY = 'test_results_ready',
  GENERAL_ANNOUNCEMENT = 'general_announcement'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  READ = 'read',
  FAILED = 'failed'
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push'
}

export interface INotification extends Document {
  user: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  channel: NotificationChannel;
  relatedEntity?: {
    kind: string;
    item: Types.ObjectId;
  };
  metadata?: Record<string, any>;
  scheduledFor?: Date;
  readAt?: Date;
  sentAt?: Date;
  acknowledgedAt?: Date;
  expiresAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.PENDING
    },
    channel: {
      type: String,
      enum: Object.values(NotificationChannel),
      default: NotificationChannel.IN_APP,
      required: true
    },
    relatedEntity: {
      kind: {
        type: String,
        enum: ['Appointment', 'Prescription', 'TestResult', 'User'],
        index: true
      },
      item: {
        type: Schema.Types.ObjectId,
        refPath: 'relatedEntity.kind',
        index: true
      }
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    },
    scheduledFor: {
      type: Date,
      index: true
    },
    readAt: {
      type: Date,
      default: null
    },
    sentAt: {
      type: Date,
      default: null
    },
    acknowledgedAt: {
      type: Date,
      default: null
    },
    expiresAt: {
      type: Date,
      default: function() {
        // Default to 30 days from now
        const date = new Date();
        date.setDate(date.getDate() + 30);
        return date;
      },
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete (ret as any).__v;
        return ret;
      }
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete (ret as any).__v;
        return ret;
      }
    }
  }
);

// Indexes for better query performance
notificationSchema.index({ user: 1, status: 1 });
notificationSchema.index({ 'relatedEntity.kind': 1, 'relatedEntity.item': 1 });
notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ status: 1, scheduledFor: 1 });

// Virtual for checking if notification is unread
notificationSchema.virtual('isUnread').get(function(this: INotification) {
  return !this.readAt && this.status === NotificationStatus.SENT;
});

// Static method to create a notification
notificationSchema.statics.createNotification = async function(notificationData: Partial<INotification>) {
  return this.create(notificationData);
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function() {
  if (!this.readAt) {
    this.readAt = new Date();
    await this.save();
  }
  return this;
};

// Instance method to mark as sent
notificationSchema.methods.markAsSent = async function() {
  this.status = NotificationStatus.SENT;
  this.sentAt = new Date();
  await this.save();
  return this;
};

// Pre-save hook to set default values
notificationSchema.pre('save', function(next) {
  if (this.isNew && !this.scheduledFor) {
    this.scheduledFor = new Date();
  }
  next();
});

const Notification = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
