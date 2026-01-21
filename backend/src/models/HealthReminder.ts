import mongoose, { Document, Schema, Types } from 'mongoose';

export enum ReminderType {
  MEDICATION = 'medication',
  CHECKUP = 'checkup',
  EXERCISE = 'exercise',
  DIET = 'diet',
  APPOINTMENT = 'appointment',
  CUSTOM = 'custom'
}

export enum ReminderPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface IHealthReminder extends Document {
  user: Types.ObjectId;
  title: string;
  description?: string;
  type: ReminderType;
  priority: ReminderPriority;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  aiGenerated: boolean;
  recurring?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number; // e.g., every 2 weeks = frequency: 'weekly', interval: 2
    endDate?: Date;
  };
  relatedEntity?: {
    type: 'medication' | 'appointment' | 'metric';
    id: Types.ObjectId;
  };
  notificationSent: boolean;
  snoozeUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const healthReminderSchema = new Schema<IHealthReminder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    type: {
      type: String,
      enum: {
        values: Object.values(ReminderType),
        message: 'Invalid reminder type'
      },
      required: [true, 'Reminder type is required']
    },
    priority: {
      type: String,
      enum: {
        values: Object.values(ReminderPriority),
        message: 'Invalid priority level'
      },
      default: ReminderPriority.MEDIUM
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required']
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: {
      type: Date
    },
    aiGenerated: {
      type: Boolean,
      default: false
    },
    recurring: {
      enabled: {
        type: Boolean,
        default: false
      },
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly']
      },
      interval: {
        type: Number,
        min: [1, 'Interval must be at least 1'],
        default: 1
      },
      endDate: {
        type: Date
      }
    },
    relatedEntity: {
      type: {
        type: String,
        enum: ['medication', 'appointment', 'metric']
      },
      id: {
        type: Schema.Types.ObjectId
      }
    },
    notificationSent: {
      type: Boolean,
      default: false
    },
    snoozeUntil: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
healthReminderSchema.index({ user: 1, completed: 1 });
healthReminderSchema.index({ dueDate: 1, completed: 1 });
healthReminderSchema.index({ type: 1 });
healthReminderSchema.index({ priority: 1 });

// Virtual for checking if reminder is overdue
healthReminderSchema.virtual('isOverdue').get(function(this: IHealthReminder) {
  return !this.completed && this.dueDate < new Date();
});

// Virtual for checking if reminder is snoozed
healthReminderSchema.virtual('isSnoozed').get(function(this: IHealthReminder) {
  return this.snoozeUntil && this.snoozeUntil > new Date();
});

// Pre-save middleware to set completedAt when completed
healthReminderSchema.pre('save', function(this: IHealthReminder, next) {
  if (this.isModified('completed') && this.completed && !this.completedAt) {
    this.completedAt = new Date();
  }
  next();
});

export default mongoose.model<IHealthReminder>('HealthReminder', healthReminderSchema);