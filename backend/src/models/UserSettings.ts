import mongoose, { Document, Schema } from 'mongoose';

export interface IUserSettings extends Document {
  userId: mongoose.Types.ObjectId;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    appointmentReminders: boolean;
    medicationReminders: boolean;
    healthTips: boolean;
  };
  appointmentReminders: {
    enabled: boolean;
    timing: string[];
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    screenReader: boolean;
  };
  privacy: {
    profileVisibility: 'private' | 'public';
    shareDataForResearch: boolean;
    allowMarketing: boolean;
  };
  updatedAt: Date;
}

const userSettingsSchema = new Schema<IUserSettings>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      appointmentReminders: { type: Boolean, default: true },
      medicationReminders: { type: Boolean, default: true },
      healthTips: { type: Boolean, default: true },
    },
    appointmentReminders: {
      enabled: { type: Boolean, default: true },
      timing: { type: [String], default: ['1day', '1hour'] },
    },
    accessibility: {
      fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
      highContrast: { type: Boolean, default: false },
      screenReader: { type: Boolean, default: false },
    },
    privacy: {
      profileVisibility: { type: String, enum: ['private', 'public'], default: 'private' },
      shareDataForResearch: { type: Boolean, default: false },
      allowMarketing: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

export const UserSettings = mongoose.model<IUserSettings>('UserSettings', userSettingsSchema);
export default UserSettings;
