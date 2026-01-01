import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      _id: Types.ObjectId;
      role: UserRole;
      email: string;
      name: string;
    }

    interface Request {
      user?: User;
    }
  }
}

export type UserRole = 'patient' | 'doctor' | 'admin' | 'staff';

export interface AuthenticatedRequest extends Request {
  user: Express.User;
}
