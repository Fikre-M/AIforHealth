import mongoose, { Document, Schema, Model, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

/* =========================================================
   Enums
========================================================= */

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  ADMIN = 'admin',
}

/* =========================================================
   Interface
========================================================= */

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  loginAttempts: number;
  lockUntil?: Date;

  comparePassword(password: string): Promise<boolean>;
  isLocked(): boolean;
}

/* =========================================================
   Static Interface
========================================================= */

interface UserModel extends Model<IUser> {
  findByEmailWithPassword(email: string): Promise<IUser | null>;
}

/* =========================================================
   Schema
========================================================= */

const userSchema = new Schema<IUser, UserModel>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.PATIENT,
    },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },
  { timestamps: true }
);

/* =========================================================
   Password Hashing
========================================================= */

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* =========================================================
   Methods
========================================================= */

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

/* =========================================================
   Statics
========================================================= */

userSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email }).select('+password');
};

/* =========================================================
   Model Export
========================================================= */

export const User = mongoose.model<IUser, UserModel>('User', userSchema);

export default User;
