// backend/src/middleware/validators/index.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ResponseUtil } from '@/utils/response';

// Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  location?: string;
}

export interface ValidationOptions {
  strict?: boolean;
  sanitize?: boolean;
}

// Configuration
const DEFAULT_VALIDATION_OPTIONS: ValidationOptions = {
  strict: false,
  sanitize: true,
};

/**
 * Custom error formatter for consistent error structure
 */
const formatValidationError = (error: any): ValidationError => ({
  field: error.type === 'field' ? error.path : error.param || 'unknown',
  message: error.msg,
  value: error.type === 'field' ? error.value : error.value,
  location: error.location,
});

/**
 * Enhanced validation error handler
 */
export const handleValidationErrors = (options: ValidationOptions = {}) => {
  const config = { ...DEFAULT_VALIDATION_OPTIONS, ...options };

  return (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors = errors.array().map(formatValidationError);

      // Log validation errors in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Validation errors:', {
          path: req.path,
          method: req.method,
          body: req.body,
          errors: formattedErrors,
        });
      }

      return ResponseUtil.error(res, 'Validation failed', 400, {
        code: 'VALIDATION_ERROR',
        errors: formattedErrors,
        strict: config.strict,
      });
    }

    next();
  };
};

/**
 * Validation chain builder
 */
export class ValidatorBuilder {
  private validations: ValidationChain[] = [];

  add(validationChains: ValidationChain[]): this {
    this.validations.push(...validationChains);
    return this;
  }

  build(
    options?: ValidationOptions
  ): (ValidationChain | ((req: Request, res: Response, next: NextFunction) => void))[] {
    return [...this.validations, handleValidationErrors(options)];
  }
}

/**
 * Validation registry
 */
class ValidationRegistry {
  private static instance: ValidationRegistry;
  private schemas: Map<string, ValidationChain[]> = new Map();

  private constructor() {}

  static getInstance(): ValidationRegistry {
    if (!ValidationRegistry.instance) {
      ValidationRegistry.instance = new ValidationRegistry();
    }
    return ValidationRegistry.instance;
  }

  register(name: string, schema: ValidationChain[]): void {
    this.schemas.set(name, schema);
  }

  get(name: string): ValidationChain[] | undefined {
    return this.schemas.get(name);
  }

  getAll(): Map<string, ValidationChain[]> {
    return this.schemas;
  }
}

export const validationRegistry = ValidationRegistry.getInstance();

// Re-export all validators
export * from './auth.validators';
export * from './appointment.validators';
export * from './patient.validators';
export * from './common.validators';
