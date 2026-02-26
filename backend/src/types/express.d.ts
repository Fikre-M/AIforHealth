import 'express';
import { JWTPayload } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      requestId?: string;
      id?: string;
    }
  }
}
