import mongoose, { Document, Schema, Types } from 'mongoose';

export enum MetricType {
  BLOOD_PRESSURE = 'blood_pressure',
  HEART_RATE = 'heart_rate',
  WEIGHT = 'weight',
  HEIGHT = 'height',
  TEMPERATURE = 'temperature',
  BLOOD_SUGAR = 'blood_sugar',
  CHOLESTEROL = 'cholesterol',
  BMI = 'bmi',
  OXYGEN_SATURATION = 'oxygen_saturation',
  CUSTOM = 'custom'
}

export enum MetricStatus {
  NORMAL = 'normal',
  LOW = 'low',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum MetricTrend {
  UP = 'up',
  DOWN = 'down',
  STABLE = 'stable'
}

export interface IHealthMetric extends Document {
  user: Types.ObjectId;
  type: MetricType;
  name: string;
  value: number;
  unit: string;
  status: MetricStatus;
  trend?: MetricTrend;
  recordedDate: Date;
  recordedBy?: Types.ObjectId; // Doctor or patient who recorded it
  notes?: string;
  referenceRange?: {
    min: number;
    max: number;
    unit: string;
  };
  relatedAppointment?: Types.ObjectId;
  deviceInfo?: {
    name: string;
    model?: string;
    accuracy?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const healthMetricSchema = new Schema<IHealthMetric>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    type: {
      type: String,
      enum: {
        values: Object.values(MetricType),
        message: 'Invalid metric type'
      },
      required: [true, 'Metric type is required']
    },
    name: {
      type: String,
      required: [true, 'Metric name is required'],
      trim: true,
      maxlength: [100, 'Metric name cannot exceed 100 characters']
    },
    value: {
      type: Number,
      required: [true, 'Metric value is required'],
      min: [0, 'Metric value cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
      maxlength: [20, 'Unit cannot exceed 20 characters']
    },
    status: {
      type: String,
      enum: {
        values: Object.values(MetricStatus),
        message: 'Invalid metric status'
      },
      default: MetricStatus.NORMAL
    },
    trend: {
      type: String,
      enum: {
        values: Object.values(MetricTrend),
        message: 'Invalid trend value'
      }
    },
    recordedDate: {
      type: Date,
      required: [true, 'Recorded date is required'],
      default: Date.now
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters']
    },
    referenceRange: {
      min: {
        type: Number,
        required: function(this: IHealthMetric) {
          return this.referenceRange !== undefined;
        }
      },
      max: {
        type: Number,
        required: function(this: IHealthMetric) {
          return this.referenceRange !== undefined;
        }
      },
      unit: {
        type: String,
        required: function(this: IHealthMetric) {
          return this.referenceRange !== undefined;
        }
      }
    },
    relatedAppointment: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment'
    },
    deviceInfo: {
      name: {
        type: String,
        trim: true,
        maxlength: [100, 'Device name cannot exceed 100 characters']
      },
      model: {
        type: String,
        trim: true,
        maxlength: [100, 'Device model cannot exceed 100 characters']
      },
      accuracy: {
        type: String,
        trim: true,
        maxlength: [50, 'Accuracy description cannot exceed 50 characters']
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for better query performance
healthMetricSchema.index({ user: 1, type: 1 });
healthMetricSchema.index({ recordedDate: -1 });
healthMetricSchema.index({ status: 1 });
healthMetricSchema.index({ relatedAppointment: 1 });

// Virtual for checking if metric is within normal range
healthMetricSchema.virtual('isNormal').get(function(this: IHealthMetric) {
  if (!this.referenceRange) return this.status === MetricStatus.NORMAL;
  
  return this.value >= this.referenceRange.min && this.value <= this.referenceRange.max;
});

// Virtual for getting formatted value with unit
healthMetricSchema.virtual('formattedValue').get(function(this: IHealthMetric) {
  return `${this.value} ${this.unit}`;
});

// Pre-save middleware to auto-determine status based on reference range
healthMetricSchema.pre('save', function(this: IHealthMetric, next) {
  if (this.referenceRange && this.isModified('value')) {
    if (this.value < this.referenceRange.min) {
      this.status = MetricStatus.LOW;
    } else if (this.value > this.referenceRange.max) {
      this.status = MetricStatus.HIGH;
    } else {
      this.status = MetricStatus.NORMAL;
    }
  }
  next();
});

export default mongoose.model<IHealthMetric>('HealthMetric', healthMetricSchema);