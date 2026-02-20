import mongoose, { Document, Schema, Types } from 'mongoose';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  MISSED = 'missed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled'
}

export enum AppointmentType {
  CONSULTATION = 'consultation',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
  ROUTINE_CHECKUP = 'routine_checkup',
  SPECIALIST = 'specialist',
  TELEMEDICINE = 'telemedicine'
}

export interface IAppointment extends Document {
  patient: Types.ObjectId;
  doctor: Types.ObjectId;
  appointmentDate: Date;
  duration: number; // in minutes
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string;
  notes?: string;
  doctorNotes?: string;
  prescription?: string;
  diagnosis?: string;
  symptoms?: string[];
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  followUpRequired?: boolean;
  followUpDate?: Date;
  cancelledBy?: Types.ObjectId;
  cancellationReason?: string;
  rescheduledFrom?: Types.ObjectId;
  reminderSent?: boolean;
  isEmergency?: boolean;
  paymentStatus?: 'pending' | 'paid' | 'refunded';
  amount?: number;
  confirmationNumber: string;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;

  // Virtual methods
  isUpcoming(): boolean;
  isPast(): boolean;
  canBeCancelled(): boolean;
  canBeRescheduled(): boolean;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Patient reference is required'],
      validate: {
        validator: async function(patientId: Types.ObjectId) {
          const User = mongoose.model('User');
          const patient = await User.findById(patientId);
          return patient && patient.role === 'patient';
        },
        message: 'Referenced user must be a patient'
      }
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Doctor reference is required'],
      validate: {
        validator: async function(doctorId: Types.ObjectId) {
          const User = mongoose.model('User');
          const doctor = await User.findById(doctorId);
          return doctor && doctor.role === 'doctor';
        },
        message: 'Referenced user must be a doctor'
      }
    },
    appointmentDate: {
      type: Date,
      required: [true, 'Appointment date and time is required'],
      validate: {
        validator: function(date: Date) {
          return date > new Date();
        },
        message: 'Appointment date must be in the future'
      }
    },
    duration: {
      type: Number,
      required: [true, 'Appointment duration is required'],
      min: [15, 'Minimum appointment duration is 15 minutes'],
      max: [240, 'Maximum appointment duration is 4 hours'],
      default: 30
    },
    status: {
      type: String,
      enum: {
        values: Object.values(AppointmentStatus),
        message: 'Invalid appointment status'
      },
      default: AppointmentStatus.SCHEDULED
    },
    type: {
      type: String,
      enum: {
        values: Object.values(AppointmentType),
        message: 'Invalid appointment type'
      },
      required: [true, 'Appointment type is required'],
      default: AppointmentType.CONSULTATION
    },
    reason: {
      type: String,
      required: [true, 'Reason for appointment is required'],
      trim: true,
      maxlength: [500, 'Reason cannot exceed 500 characters']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    doctorNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Doctor notes cannot exceed 2000 characters']
    },
    prescription: {
      type: String,
      trim: true,
      maxlength: [1000, 'Prescription cannot exceed 1000 characters']
    },
    diagnosis: {
      type: String,
      trim: true,
      maxlength: [1000, 'Diagnosis cannot exceed 1000 characters']
    },
    symptoms: [{
      type: String,
      trim: true,
      maxlength: [100, 'Each symptom cannot exceed 100 characters']
    }],
    vitals: {
      bloodPressure: {
        type: String,
        match: [/^\d{2,3}\/\d{2,3}$/, 'Blood pressure must be in format XXX/XX']
      },
      heartRate: {
        type: Number,
        min: [30, 'Heart rate must be at least 30 bpm'],
        max: [250, 'Heart rate cannot exceed 250 bpm']
      },
      temperature: {
        type: Number,
        min: [30, 'Temperature must be at least 30°C'],
        max: [45, 'Temperature cannot exceed 45°C']
      },
      weight: {
        type: Number,
        min: [1, 'Weight must be at least 1 kg'],
        max: [500, 'Weight cannot exceed 500 kg']
      },
      height: {
        type: Number,
        min: [30, 'Height must be at least 30 cm'],
        max: [300, 'Height cannot exceed 300 cm']
      }
    },
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: {
      type: Date,
      validate: {
        validator: function(this: IAppointment, date: Date) {
          if (!this.followUpRequired) return true;
          return date && date > this.appointmentDate;
        },
        message: 'Follow-up date must be after the appointment date'
      }
    },
    cancelledBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    cancellationReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
    },
    rescheduledFrom: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    reminderSent: {
      type: Boolean,
      default: false
    },
    isEmergency: {
      type: Boolean,
      default: false,
      index: true
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    },
    amount: {
      type: Number,
      min: [0, 'Amount cannot be negative'],
      default: 0
    },
    confirmationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    qrCode: {
      type: String
    }
  },
  {
    timestamps: true,
    toJSON: { 
      virtuals: true,
      transform: function(doc, ret) {
        const { __v, ...appointmentObject } = ret;
        return appointmentObject;
      }
    },
    toObject: { 
      virtuals: true,
      transform: function(doc, ret) {
        const { __v, ...appointmentObject } = ret;
        return appointmentObject;
      }
    }
  }
);

// Indexes for better performance
appointmentSchema.index({ patient: 1, appointmentDate: 1 });
appointmentSchema.index({ doctor: 1, appointmentDate: 1 });
appointmentSchema.index({ appointmentDate: 1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ type: 1 });
appointmentSchema.index({ createdAt: -1 });

// Compound index for preventing double booking
appointmentSchema.index(
  { doctor: 1, appointmentDate: 1, status: 1 },
  { 
    unique: true,
    partialFilterExpression: { 
      status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] }
    }
  }
);

// Virtual for checking if appointment is upcoming
appointmentSchema.virtual('isUpcoming').get(function(this: IAppointment) {
  return this.appointmentDate > new Date() && 
         [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(this.status);
});

// Virtual for checking if appointment is past
appointmentSchema.virtual('isPast').get(function(this: IAppointment) {
  return this.appointmentDate < new Date();
});

// Virtual for appointment end time
appointmentSchema.virtual('endTime').get(function(this: IAppointment) {
  return new Date(this.appointmentDate.getTime() + (this.duration * 60000));
});

// Instance method to check if appointment can be cancelled
appointmentSchema.methods.canBeCancelled = function(this: IAppointment): boolean {
  const now = new Date();
  const appointmentTime = this.appointmentDate;
  const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(this.status) &&
         hoursUntilAppointment >= 2; // Can cancel up to 2 hours before
};

// Instance method to check if appointment can be rescheduled
appointmentSchema.methods.canBeRescheduled = function(this: IAppointment): boolean {
  const now = new Date();
  const appointmentTime = this.appointmentDate;
  const hoursUntilAppointment = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(this.status) &&
         hoursUntilAppointment >= 4; // Can reschedule up to 4 hours before
};

// Pre-save middleware to validate appointment conflicts
appointmentSchema.pre('save', async function(next) {
  // Generate confirmation number for new appointments
  if (this.isNew && !this.confirmationNumber) {
    this.confirmationNumber = generateConfirmationNumber();
  }

  if (this.isNew || this.isModified('appointmentDate') || this.isModified('doctor')) {
    const conflictingAppointment = await mongoose.model('Appointment').findOne({
      doctor: this.doctor,
      appointmentDate: {
        $gte: this.appointmentDate,
        $lt: new Date(this.appointmentDate.getTime() + (this.duration * 60000))
      },
      status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED, AppointmentStatus.IN_PROGRESS] },
      _id: { $ne: this._id }
    });

    if (conflictingAppointment) {
      const error = new Error('Doctor is not available at this time');
      return next(error);
    }
  }

  // Auto-update status based on appointment date
  const now = new Date();
  if (this.appointmentDate < now && this.status === AppointmentStatus.SCHEDULED) {
    this.status = AppointmentStatus.MISSED;
  }

  next();
});

// Pre-save middleware to handle status changes
appointmentSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === AppointmentStatus.CANCELLED && !this.cancelledBy) {
      const error = new Error('Cancelled appointments must have cancelledBy field');
      return next(error);
    }
    
    if (this.status === AppointmentStatus.CANCELLED && !this.cancellationReason) {
      const error = new Error('Cancelled appointments must have a cancellation reason');
      return next(error);
    }
  }
  
  next();
});

// Static method to find appointments by patient
appointmentSchema.statics.findByPatient = function(patientId: string, options: any = {}) {
  return this.find({ patient: patientId, ...options })
    .populate('doctor', 'name email')
    .populate('patient', 'name email')
    .sort({ appointmentDate: -1 });
};

// Static method to find appointments by doctor
appointmentSchema.statics.findByDoctor = function(doctorId: string, options: any = {}) {
  return this.find({ doctor: doctorId, ...options })
    .populate('doctor', 'name email')
    .populate('patient', 'name email')
    .sort({ appointmentDate: 1 });
};

// Static method to find upcoming appointments
appointmentSchema.statics.findUpcoming = function(userId?: string) {
  const query: any = {
    appointmentDate: { $gte: new Date() },
    status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] }
  };
  
  if (userId) {
    query.$or = [{ patient: userId }, { doctor: userId }];
  }
  
  return this.find(query)
    .populate('doctor', 'name email')
    .populate('patient', 'name email')
    .sort({ appointmentDate: 1 });
};

// Static method to get appointment statistics
appointmentSchema.statics.getStats = function(doctorId?: string) {
  const matchStage: any = {};
  if (doctorId) {
    matchStage.doctor = new mongoose.Types.ObjectId(doctorId);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAppointments: { $sum: 1 },
        scheduledCount: {
          $sum: { $cond: [{ $eq: ['$status', AppointmentStatus.SCHEDULED] }, 1, 0] }
        },
        completedCount: {
          $sum: { $cond: [{ $eq: ['$status', AppointmentStatus.COMPLETED] }, 1, 0] }
        },
        cancelledCount: {
          $sum: { $cond: [{ $eq: ['$status', AppointmentStatus.CANCELLED] }, 1, 0] }
        },
        missedCount: {
          $sum: { $cond: [{ $eq: ['$status', AppointmentStatus.MISSED] }, 1, 0] }
        },
        averageAmount: { $avg: '$amount' },
        totalRevenue: { $sum: '$amount' }
      }
    }
  ]);
};

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);

// Helper function to generate confirmation number
function generateConfirmationNumber(): string {
  const prefix = 'APT';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

export default Appointment;