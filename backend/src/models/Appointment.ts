import mongoose, { Document, Schema, Model, Types } from 'mongoose';

/* =========================================================
   Enums
========================================================= */

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  MISSED = 'missed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
}

export enum AppointmentType {
  CONSULTATION = 'consultation',
  FOLLOW_UP = 'follow_up',
  EMERGENCY = 'emergency',
  ROUTINE_CHECKUP = 'routine_checkup',
  SPECIALIST = 'specialist',
  TELEMEDICINE = 'telemedicine',
}

/* =========================================================
   Interface
========================================================= */

export interface IAppointment extends Document {
  patient: Types.ObjectId;
  doctor: Types.ObjectId;
  appointmentDate: Date;
  duration: number;
  status: AppointmentStatus;
  type: AppointmentType;
  reason: string;
  reminderSent?: boolean;
  confirmationNumber: string;

  createdAt: Date;
  updatedAt: Date;

  canBeCancelled(): boolean;
  canBeRescheduled(): boolean;
}

/* =========================================================
   Static Interface
========================================================= */

interface AppointmentModel extends Model<IAppointment> {
  findByPatient(patientId: string, options?: Record<string, unknown>): Promise<IAppointment[]>;

  findByDoctor(doctorId: string, options?: Record<string, unknown>): Promise<IAppointment[]>;

  findUpcoming(userId?: string): Promise<IAppointment[]>;
}

/* =========================================================
   Schema
========================================================= */

const appointmentSchema = new Schema<IAppointment, AppointmentModel>(
  {
    patient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      default: 30,
    },
    status: {
      type: String,
      enum: Object.values(AppointmentStatus),
      default: AppointmentStatus.SCHEDULED,
    },
    type: {
      type: String,
      enum: Object.values(AppointmentType),
      default: AppointmentType.CONSULTATION,
    },
    reason: {
      type: String,
      required: true,
    },
    reminderSent: {
      type: Boolean,
      default: false,
    },
    confirmationNumber: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

/* =========================================================
   Methods
========================================================= */

appointmentSchema.methods.canBeCancelled = function (): boolean {
  const hours = (this.appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60);

  return (
    [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(this.status) && hours >= 2
  );
};

appointmentSchema.methods.canBeRescheduled = function (): boolean {
  const hours = (this.appointmentDate.getTime() - Date.now()) / (1000 * 60 * 60);

  return (
    [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(this.status) && hours >= 4
  );
};

/* =========================================================
   Statics
========================================================= */

appointmentSchema.statics.findByPatient = function (
  patientId: string,
  options: Record<string, unknown> = {}
) {
  return this.find({ patient: patientId, ...options });
};

appointmentSchema.statics.findByDoctor = function (
  doctorId: string,
  options: Record<string, unknown> = {}
) {
  return this.find({ doctor: doctorId, ...options });
};

appointmentSchema.statics.findUpcoming = function (userId?: string) {
  const query: Record<string, unknown> = {
    appointmentDate: { $gte: new Date() },
    status: {
      $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED],
    },
  };

  if (userId) {
    query.$or = [{ patient: userId }, { doctor: userId }];
  }

  return this.find(query);
};

/* =========================================================
   Model Export
========================================================= */

export const Appointment = mongoose.model<IAppointment, AppointmentModel>(
  'Appointment',
  appointmentSchema
);

export default Appointment;
