// backend/src/middleware/validators/common.validators.ts
import { query, body } from 'express-validator';
import { baseValidators } from './base.validators';
import { ValidatorBuilder, validationRegistry } from './index';

export const commonValidators = {
  // Pagination validator
  pagination: new ValidatorBuilder().add(Object.values(baseValidators.pagination)).build(),

  // Date range validator
  dateRange: new ValidatorBuilder()
    .add([
      query('startDate').isISO8601().withMessage('Invalid start date'),
      query('endDate')
        .isISO8601()
        .custom((value, { req }) => {
          if (req.query && req.query.startDate && new Date(value) <= new Date(req.query.startDate as string)) {
            throw new Error('End date must be after start date');
          }
          return true;
        })
        .withMessage('Invalid end date'),
    ])
    .build(),

  // Search validator
  search: new ValidatorBuilder()
    .add([
      query('q')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Search term must be at least 2 characters'),
      query('fields').optional().isString().withMessage('Fields must be a comma-separated string'),
    ])
    .build(),

  // File upload validator
  fileUpload: new ValidatorBuilder()
    .add([
      body('file').custom((value, { req }) => {
        if (!req.file) {
          throw new Error('File is required');
        }
        return true;
      }),
      body('fileType')
        .optional()
        .isIn(['image', 'document', 'lab_report'])
        .withMessage('Invalid file type'),
    ])
    .build(),

  // Bulk operation validator
  bulkOperation: new ValidatorBuilder()
    .add([
      body('ids').isArray({ min: 1, max: 100 }).withMessage('IDs must be an array of 1-100 items'),
      body('ids.*').isMongoId().withMessage('Invalid ID format'),
      body('operation')
        .isIn(['delete', 'archive', 'restore', 'update'])
        .withMessage('Invalid operation'),
      body('data')
        .optional()
        .isObject()
        .withMessage('Data must be an object for update operations'),
    ])
    .build(),

  // Export data validator
  exportData: new ValidatorBuilder()
    .add([
      query('format').isIn(['csv', 'pdf', 'excel', 'json']).withMessage('Invalid export format'),
      query('fields').optional().isString().withMessage('Fields must be a comma-separated string'),
      ...Object.values(baseValidators.pagination),
    ])
    .build(),

  // Import data validator
  importData: new ValidatorBuilder()
    .add([
      body('format').isIn(['csv', 'json']).withMessage('Invalid import format'),
      body('data').notEmpty().withMessage('Data is required'),
      body('overwriteExisting')
        .optional()
        .isBoolean()
        .withMessage('overwriteExisting must be a boolean'),
      body('validateOnly').optional().isBoolean().withMessage('validateOnly must be a boolean'),
    ])
    .build(),
};

// Register validators
validationRegistry.register('common:pagination', commonValidators.pagination as any);
validationRegistry.register('common:dateRange', commonValidators.dateRange as any);
