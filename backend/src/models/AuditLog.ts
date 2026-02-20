import mongoose, { Document, Schema } from 'mongoose';

export interface IAuditLog extends Document {
  userId?: mongoose.Types.ObjectId;
  action: string;
  resource: string;
  resourceId?: string;
  method: string;
  ip?: string;
  userAgent?: string;
  requestBody?: any;
  responseStatus?: number;
  success: boolean;
  errorMessage?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
      enum: [
        // Authentication
        'LOGIN',
        'LOGOUT',
        'REGISTER',
        'PASSWORD_CHANGE',
        'PASSWORD_RESET',
        // Patient Data Access (HIPAA)
        'VIEW_PATIENT_DATA',
        'UPDATE_PATIENT_DATA',
        'DELETE_PATIENT_DATA',
        'EXPORT_PATIENT_DATA',
        // Appointments
        'CREATE_APPOINTMENT',
        'UPDATE_APPOINTMENT',
        'CANCEL_APPOINTMENT',
        'VIEW_APPOINTMENT',
        // Medical Records
        'VIEW_MEDICAL_RECORD',
        'UPDATE_MEDICAL_RECORD',
        'ADD_DIAGNOSIS',
        'ADD_PRESCRIPTION',
        // Admin Actions
        'ADMIN_USER_CREATE',
        'ADMIN_USER_UPDATE',
        'ADMIN_USER_DELETE',
        'ADMIN_ROLE_CHANGE',
        // Security Events
        'FAILED_LOGIN',
        'ACCOUNT_LOCKED',
        'SUSPICIOUS_ACTIVITY',
        'RATE_LIMIT_EXCEEDED',
      ],
    },
    resource: {
      type: String,
      required: true,
      index: true,
    },
    resourceId: {
      type: String,
      index: true,
    },
    method: {
      type: String,
      required: true,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    ip: {
      type: String,
      index: true,
    },
    userAgent: {
      type: String,
    },
    requestBody: {
      type: Schema.Types.Mixed,
      // Sanitize sensitive data before storing
    },
    responseStatus: {
      type: Number,
    },
    success: {
      type: Boolean,
      required: true,
      default: true,
      index: true,
    },
    errorMessage: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
  },
  {
    timestamps: false, // Using custom timestamp field
    collection: 'audit_logs',
  }
);

// Compound indexes for common queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resource: 1, timestamp: -1 });
auditLogSchema.index({ success: 1, timestamp: -1 });

// TTL index - automatically delete logs older than 6 years (HIPAA requirement)
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 189216000 }); // 6 years

// Static method to log action
auditLogSchema.statics.logAction = async function(data: Partial<IAuditLog>) {
  try {
    return await this.create({
      ...data,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should never break the application
  }
};

// Static method to get user activity
auditLogSchema.statics.getUserActivity = function(
  userId: string,
  options: { startDate?: Date; endDate?: Date; limit?: number } = {}
) {
  const query: any = { userId };
  
  if (options.startDate || options.endDate) {
    query.timestamp = {};
    if (options.startDate) query.timestamp.$gte = options.startDate;
    if (options.endDate) query.timestamp.$lte = options.endDate;
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(options.limit || 100)
    .lean();
};

// Static method to get security events
auditLogSchema.statics.getSecurityEvents = function(
  options: { startDate?: Date; limit?: number } = {}
) {
  const query: any = {
    action: {
      $in: ['FAILED_LOGIN', 'ACCOUNT_LOCKED', 'SUSPICIOUS_ACTIVITY', 'RATE_LIMIT_EXCEEDED'],
    },
  };
  
  if (options.startDate) {
    query.timestamp = { $gte: options.startDate };
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(options.limit || 100)
    .populate('userId', 'email name')
    .lean();
};

const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema);

export default AuditLog;
