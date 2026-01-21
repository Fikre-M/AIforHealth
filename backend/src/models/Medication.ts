import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IMedication extends Document {
  patient: Types.ObjectId;
  prescribedBy: Types.ObjectId;
  name: string;
  dosage: string;
  frequency: string;
  instructions?: string;
  startDate: Date;
  endDate?: Date;
  nextDose?: Date;
  remainingDoses?: number;
  totalDoses?: number;
  sideEffects?: string[];
  isActive: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const medicationSchema = new Schema<IMedication>(
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
    prescribedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Prescribing doctor reference is required'],
      validate: {
        validator: async function(doctorId: Types.ObjectId) {
          const User = mongoose.model('User');
          const doctor = await User.findById(doctorId);
          return doctor && doctor.role === 'doctor';
        },
        message: 'Referenced user must be a doctor'
      }
    },
    name: {
      type: String,
      required: [true, 'Medication name is required'],
      trim: true,
      maxlength: [100, 'Medication name cannot exceed 100 characters']
    },
    dosage: {
      type: String,
      required: [true, 'Dosage is required'],
      trim: true,
      maxlength: [50, 'Dosage cannot exceed 50 characters']
    },
    frequency: {
      type: String,
      required: [true, 'Frequency is required'],
      trim: true,
      maxlength: [100, 'Frequency cannot exceed 100 characters']
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [500, 'Instructions cannot exceed 500 characters']
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now
    },
    endDate: {
      type: Date,
      validate: {
        validator: function(this: IMedication, endDate: Date) {
          return !endDate || endDate > this.startDate;
        },
        message: 'End date must be after start date'
      }
    },
    nextDose: {
      type: Date
    },
    remainingDoses: {
      type: Number,
      min: [0, 'Remaining doses cannot be negative']
    },
    totalDoses: {
      type: Number,
      min: [1, 'Total doses must be at least 1']
    },
    sideEffects: [{
      type: String,
      trim: true,
      maxlength: [100, 'Side effect description cannot exceed 100 characters']
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
medicationSchema.index({ patient: 1, isActive: 1 });
medicationSchema.index({ prescribedBy: 1 });
medicationSchema.index({ nextDose: 1 });

// Virtual for checking if medication is expired
medicationSchema.virtual('isExpired').get(function(this: IMedication) {
  return this.endDate && this.endDate < new Date();
});

// Virtual for checking if medication is due
medicationSchema.virtual('isDue').get(function(this: IMedication) {
  return this.nextDose && this.nextDose <= new Date();
});

export default mongoose.model<IMedication>('Medication', medicationSchema);