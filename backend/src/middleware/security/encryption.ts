import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const IV_LENGTH = 16;

// Encrypt sensitive data
export const encryptData = (text: string): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  return iv.toString('hex') + ':' + encrypted.toString('hex');
};

// Decrypt sensitive data
export const decryptData = (text: string): string => {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);

  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString();
};

// Hash data with salt
export const hashData = (data: string): string => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(data, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

// Verify hashed data
export const verifyHash = (data: string, hashedData: string): boolean => {
  const [salt, hash] = hashedData.split(':');
  const verifyHash = crypto.pbkdf2Sync(data, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

// Encrypt request body middleware
export const encryptRequestBody = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      fields.forEach((field) => {
        if (req.body[field]) {
          req.body[field] = encryptData(req.body[field]);
        }
      });
      next();
    } catch (error) {
      logger.error('Encryption error', { error });
      res.status(500).json({
        success: false,
        message: 'Encryption failed',
        code: 'ENCRYPTION_ERROR',
      });
    }
  };
};

// Decrypt request body middleware
export const decryptRequestBody = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      fields.forEach((field) => {
        if (req.body[field]) {
          req.body[field] = decryptData(req.body[field]);
        }
      });
      next();
    } catch (error) {
      logger.error('Decryption error', { error });
      res.status(500).json({
        success: false,
        message: 'Decryption failed',
        code: 'DECRYPTION_ERROR',
      });
    }
  };
};
