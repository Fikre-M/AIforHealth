import mongoose, { Document, Schema } from 'mongoose';

export interface IClinic extends Document {
  name: string;
  address: string;
  phone: string;
  rating: number;
  specialties: string[];
  image?: string;
  isOpen: boolean;
  openingHours: {
    [key: string]: { open: string; close: string } | null;
  };
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt: Date;
  updatedAt: Date;
}

const clinicSchema = new Schema<IClinic>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 4.0,
    },
    specialties: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],
    image: {
      type: String,
      trim: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    openingHours: {
      monday: {
        open: { type: String, default: '08:00' },
        close: { type: String, default: '18:00' },
      },
      tuesday: {
        open: { type: String, default: '08:00' },
        close: { type: String, default: '18:00' },
      },
      wednesday: {
        open: { type: String, default: '08:00' },
        close: { type: String, default: '18:00' },
      },
      thursday: {
        open: { type: String, default: '08:00' },
        close: { type: String, default: '18:00' },
      },
      friday: {
        open: { type: String, default: '08:00' },
        close: { type: String, default: '18:00' },
      },
      saturday: {
        open: { type: String, default: '09:00' },
        close: { type: String, default: '17:00' },
      },
      sunday: {
        open: { type: String, default: '10:00' },
        close: { type: String, default: '16:00' },
      },
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Index for geospatial queries
clinicSchema.index({ location: '2dsphere' });

export const Clinic = mongoose.model<IClinic>('Clinic', clinicSchema);
