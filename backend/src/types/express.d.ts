import 'express';
import { UserRole } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: UserRole;
        iat: number;
        exp: number;
      };
      requestId?: string;
      id?: string;
    }
  }
}

export interface AuthenticatedRequest extends Express.Request {
  user?: {
    userId: string;
    email: string;
    role: UserRole;
    iat: number;
    exp: number;
  };
  headers: Express.Request['headers'];
  params: Express.Request['params'];
}
