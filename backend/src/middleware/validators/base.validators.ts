// backend/src/middleware/validators/base.validators.ts
import { body, param, query, ValidationChain } from 'express-validator';

/**
 * Base validation rules that can be composed
 */
export const baseValidators = {
  // ID validators
  id: (field: string = 'id', location: 'param' | 'body' | 'query' = 'param'): ValidationChain => {
    const validator =
      location === 'param' ? param(field) : location === 'query' ? query(field) : body(field);
    return validator.isMongoId().withMessage(`Invalid ${field} format`);
  },

  // Email validators
  email: (field: string = 'email', required: boolean = true): ValidationChain => {
    let validator = body(field);
    if (!required) {
      validator = validator.optional();
    }
    return validator.isEmail().normalizeEmail().withMessage('Invalid email format');
  },

  // Password validators
  password: (field: string = 'password', minLength: number = 8): ValidationChain =>
    body(field)
      .isLength({ min: minLength })
      .withMessage(`Password must be at least ${minLength} characters`)
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character'),

  // Name validators
  name: (field: string = 'name', min: number = 2, max: number = 100): ValidationChain =>
    body(field)
      .trim()
      .notEmpty()
      .isLength({ min, max })
      .withMessage(`${field} must be ${min}-${max} characters`),

  // Date validators
  date: (field: string = 'date', required: boolean = true): ValidationChain => {
    let validator = body(field);
    if (!required) {
      validator = validator.optional();
    }
    return validator.isISO8601().toDate().withMessage('Invalid date format');
  },

  futureDate: (field: string = 'date'): ValidationChain =>
    body(field)
      .isISO8601()
      .toDate()
      .custom((value) => {
        if (value <= new Date()) {
          throw new Error('Date must be in the future');
        }
        return true;
      })
      .withMessage('Invalid date format'),

  pastDate: (field: string = 'date'): ValidationChain =>
    body(field)
      .isISO8601()
      .toDate()
      .custom((value) => {
        if (value >= new Date()) {
          throw new Error('Date must be in the past');
        }
        return true;
      })
      .withMessage('Invalid date format'),

  // Pagination validators
  pagination: {
    page: query('page')
      .optional()
      .isInt({ min: 1 })
      .toInt()
      .withMessage('Page must be a positive integer'),

    limit: query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .toInt()
      .withMessage('Limit must be between 1 and 100'),

    sortBy: query('sortBy').optional().isString().withMessage('SortBy must be a string'),

    sortOrder: query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('SortOrder must be asc or desc'),
  },

  // Phone validator
  phone: (field: string = 'phone', required: boolean = false): ValidationChain => {
    let validator = body(field);
    if (!required) {
      validator = validator.optional();
    }
    return validator.matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format');
  },

  // Enum validator
  enum: (field: string, allowedValues: string[], required: boolean = true): ValidationChain => {
    let validator = body(field);
    if (!required) {
      validator = validator.optional();
    }
    return validator
      .isIn(allowedValues)
      .withMessage(`Invalid value. Allowed: ${allowedValues.join(', ')}`);
  },

  // Number validators
  number: (
    field: string,
    options?: { min?: number; max?: number; required?: boolean }
  ): ValidationChain => {
    let validator = body(field);
    if (options?.required === false) {
      validator = validator.optional();
    }
    validator = validator.isNumeric().withMessage(`${field} must be a number`);

    if (options?.min !== undefined) {
      validator = validator
        .isFloat({ min: options.min })
        .withMessage(`${field} must be at least ${options.min}`);
    }
    if (options?.max !== undefined) {
      validator = validator
        .isFloat({ max: options.max })
        .withMessage(`${field} must be at most ${options.max}`);
    }

    return validator;
  },

  // Boolean validator
  boolean: (field: string, required: boolean = false): ValidationChain => {
    let validator = body(field);
    if (!required) {
      validator = validator.optional();
    }
    return validator.isBoolean().toBoolean().withMessage(`${field} must be a boolean`);
  },

  // URL validator
  url: (field: string, required: boolean = false): ValidationChain => {
    let validator = body(field);
    if (!required) {
      validator = validator.optional();
    }
    return validator.isURL().withMessage('Invalid URL format');
  },

  // String length validator
  stringLength: (
    field: string,
    min: number,
    max: number,
    required: boolean = true
  ): ValidationChain => {
    let validator = body(field);
    if (!required) {
      validator = validator.optional();
    }
    return validator
      .trim()
      .isLength({ min, max })
      .withMessage(`${field} must be ${min}-${max} characters`);
  },

  // Array validator
  array: (
    field: string,
    options?: { min?: number; max?: number; required?: boolean }
  ): ValidationChain => {
    let validator = body(field);
    if (options?.required === false) {
      validator = validator.optional();
    }
    validator = validator.isArray().withMessage(`${field} must be an array`);

    if (options?.min !== undefined) {
      validator = validator
        .isArray({ min: options.min })
        .withMessage(`${field} must have at least ${options.min} items`);
    }
    if (options?.max !== undefined) {
      validator = validator
        .isArray({ max: options.max })
        .withMessage(`${field} must have at most ${options.max} items`);
    }

    return validator;
  },

  // Object validator
  object: (field: string, required: boolean = true): ValidationChain => {
    let validator = body(field);
    if (!required) {
      validator = validator.optional();
    }
    return validator.isObject().withMessage(`${field} must be an object`);
  },
};
