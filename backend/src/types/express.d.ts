import { Types } from 'mongoose';

export type UserRole = 'patient' | 'doctor' | 'admin' | 'staff';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    _id: Types.ObjectId;
    role: string;
    email: string;
    name?: string;
    iat?: number;
    exp?: number;
  };
}
