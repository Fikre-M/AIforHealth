import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserRole } from '@/types/enums';
import type { UserRole as UserRoleType } from '@/types';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRoleType;
  isActive: boolean;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Patient-specific fields
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  avatar?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: string[];
  allergies?: string[];
  currentMedications?: string[];
  createdBy?: mongoose.Types.ObjectId; // For doctor-created patients
  
  // Doctor-specific profile
  profile?: {
    clinicId?: mongoose.Types.ObjectId;
    specialty?: string;
    experience?: number;
    education?: string[];
    languages?: string[];
    rating?: number;
    consultationFee?: number;
    isAvailable?: boolean;
    bio?: string;
    avatar?: string;
  };
  
  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
  generateEmailVerificationToken(): string;
  isLocked(): boolean;
  incrementLoginAttempts(): Promise<void>;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false, // Don't include password in queries by default
    },
    role: {
      type: String,
      enum: {
        values: Object.values(UserRole),
        message: 'Role must be either patient, doctor, or admin',
      },
      default: UserRole.PATIENT,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
    // Patient-specific fields
    phone: {
      type: String,
      trim: true,
      match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid phone number'],
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    avatar: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      name: {
        type: String,
        trim: true,
        maxlength: [50, 'Emergency contact name cannot exceed 50 characters'],
      },
      phone: {
        type: String,
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please provide a valid emergency contact phone number'],
      },
      relationship: {
        type: String,
        trim: true,
        maxlength: [30, 'Relationship cannot exceed 30 characters'],
      },
    },
    medicalHistory: [{
      type: String,
      trim: true,
    }],
    allergies: [{
      type: String,
      trim: true,
    }],
    currentMedications: [{
      type: String,
      trim: true,
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    // Doctor-specific profile
    profile: {
      clinicId: {
        type: Schema.Types.ObjectId,
        ref: 'Clinic',
      },
      specialty: {
        type: String,
        trim: true,
      },
      experience: {
        type: Number,
        min: 0,
      },
      education: [{
        type: String,
        trim: true,
      }],
      languages: [{
        type: String,
        trim: true,
      }],
      rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 4.0,
      },
      consultationFee: {
        type: Number,
        min: 0,
      },
      isAvailable: {
        type: Boolean,
        default: true,
      },
      bio: {
        type: String,
        trim: true,
        maxlength: 500,
      },
      avatar: {
        type: String,
        trim: true,
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        const { password, passwordResetToken, passwordResetExpires, emailVerificationToken, __v, ...userObject } = ret;
        return userObject;
      },
    },
    toObject: {
      transform: function (doc, ret) {
        const { password, passwordResetToken, passwordResetExpires, emailVerificationToken, __v, ...userObject } = ret;
        return userObject;
      },
    },
  }
);

// Indexes for performance (email index is already created by unique: true)
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Constants for account locking
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

// Virtual for account lock status
userSchema.virtual('accountLocked').get(function (this: IUser) {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-save middleware to handle login attempts
userSchema.pre('save', function (next) {
  // If we have a previous value and we're not modifying loginAttempts
  if (!this.isNew && !this.isModified('loginAttempts')) {
    return next();
  }

  // If we have too many attempts and no lock expiration, set lock
  if (this.loginAttempts >= MAX_LOGIN_ATTEMPTS && !this.lockUntil) {
    this.lockUntil = new Date(Date.now() + LOCK_TIME);
  }

  next();
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to generate password reset token
userSchema.methods.generatePasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = resetToken;
  this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  
  return resetToken;
};

// Instance method to generate email verification token
userSchema.methods.generateEmailVerificationToken = function (): string {
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  this.emailVerificationToken = verificationToken;
  
  return verificationToken;
};

// Instance method to check if account is locked
userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil > new Date());
};

// Instance method to increment login attempts
userSchema.methods.incrementLoginAttempts = async function (): Promise<void> {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 },
    });
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // If we have hit max attempts and it's not locked yet, add the lock
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + LOCK_TIME };
  }
  
  return this.updateOne(updates);
};

// Static method to find user by email with password
userSchema.statics.findByEmailWithPassword = function (email: string) {
  return this.findOne({ email }).select('+password');
};

// Static method to unlock account
userSchema.statics.unlockAccount = function (userId: string) {
  return this.updateOne(
    { _id: userId },
    {
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 0 },
    }
  );
};

// Pre-remove middleware to handle cascade deletion
userSchema.pre('findOneAndDelete', async function(next) {
  try {
    const userId = this.getQuery()._id;
    
    if (userId) {
      // Check if user has any active appointments
      const Appointment = mongoose.model('Appointment');
      const activeAppointments = await Appointment.countDocuments({
        $or: [{ patient: userId }, { doctor: userId }],
        status: { $in: ['scheduled', 'confirmed', 'in_progress'] }
      });

      if (activeAppointments > 0) {
        throw new Error('Cannot delete user with active appointments. Please cancel or complete all appointments first.');
      }

      // Soft delete: mark past appointments as archived instead of deleting
      await Appointment.updateMany(
        { $or: [{ patient: userId }, { doctor: userId }] },
        { $set: { isArchived: true } }
      );
    }
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Pre-remove middleware for deleteOne
userSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  try {
    const userId = this._id;
    
    // Check if user has any active appointments
    const Appointment = mongoose.model('Appointment');
    const activeAppointments = await Appointment.countDocuments({
      $or: [{ patient: userId }, { doctor: userId }],
      status: { $in: ['scheduled', 'confirmed', 'in_progress'] }
    });

    if (activeAppointments > 0) {
      throw new Error('Cannot delete user with active appointments. Please cancel or complete all appointments first.');
    }

    // Soft delete: mark past appointments as archived
    await Appointment.updateMany(
      { $or: [{ patient: userId }, { doctor: userId }] },
      { $set: { isArchived: true } }
    );
    
    next();
  } catch (error) {
    next(error as Error);
  }
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;