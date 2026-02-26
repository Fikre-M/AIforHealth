// backend/src/middleware/validators/appointment.validators.ts
import { body, param, query } from 'express-validator';
import { baseValidators } from './base.validators';
import { ValidatorBuilder, validationRegistry } from './index';

// Custom appointment-specific validations
const appointmentSpecificValidators = {
  checkWorkingHours: body('appointmentDate').custom((value) => {
    const date = new Date(value);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const day = date.getDay();

    // Check if within working hours (8 AM - 6 PM, Monday-Friday)
    if (day === 0 || day === 6) {
      throw new Error('Appointments are only available on weekdays');
    }
    if (hours < 8 || hours >= 18) {
      throw new Error('Appointments are only available between 8 AM and 6 PM');
    }
    if (minutes !== 0 && minutes !== 30) {
      throw new Error('Appointments must start at :00 or :30 minutes');
    }
    return true;
  }),

  validateDuration: body('duration')
    .isInt({ min: 15, max: 120 })
    .withMessage('Duration must be between 15 and 120 minutes')
    .custom((value) => {
      if (value % 15 !== 0) {
        throw new Error('Duration must be in increments of 15 minutes');
      }
      return true;
    }),

  validateReason: body('reason')
    .trim()
    .notEmpty()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be 5-500 characters')
    .matches(/^[a-zA-Z0-9\s\-_,\.;:()]+$/)
    .withMessage('Reason contains invalid characters'),
};

export const appointmentValidators = {
  // Create new appointment
  create: new ValidatorBuilder()
    .add([
      baseValidators.id('patientId', 'body'),
      baseValidators.id('doctorId', 'body'),
      baseValidators.futureDate('appointmentDate'),
      appointmentSpecificValidators.checkWorkingHours,
      appointmentSpecificValidators.validateDuration,
      appointmentSpecificValidators.validateReason,
      baseValidators.enum('type', ['consultation', 'followup', 'checkup', 'emergency', 'surgery']),
      baseValidators.enum('status', ['scheduled', 'pending'], true),
      body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes cannot exceed 1000 characters'),
      body('sendReminders').optional().isBoolean().withMessage('sendReminders must be a boolean'),
    ])
    .build(),

  // Update appointment
  update: new ValidatorBuilder()
    .add([
      baseValidators.id('id', 'param'),
      body('status')
        .optional()
        .isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show', 'rescheduled'])
        .withMessage('Invalid status'),
      body('notes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Notes cannot exceed 1000 characters'),
      body('reason')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Reason cannot exceed 500 characters'),
    ])
    .build(),

  // Reschedule appointment
  reschedule: new ValidatorBuilder()
    .add([
      baseValidators.id('id', 'param'),
      baseValidators.futureDate('newDate'),
      appointmentSpecificValidators.checkWorkingHours,
      body('reason')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Reason cannot exceed 500 characters'),
      body('notifyPatient').optional().isBoolean().withMessage('notifyPatient must be a boolean'),
    ])
    .build(),

  // Cancel appointment
  cancel: new ValidatorBuilder()
    .add([
      baseValidators.id('id', 'param'),
      body('reason')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Reason cannot exceed 500 characters'),
      body('notifyPatient').optional().isBoolean().withMessage('notifyPatient must be a boolean'),
      body('cancellationFee')
        .optional()
        .isBoolean()
        .withMessage('cancellationFee must be a boolean'),
    ])
    .build(),

  // Get by date range with pagination
  getByDateRange: new ValidatorBuilder()
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
      ...Object.values(baseValidators.pagination),
      query('doctorId').optional().isMongoId().withMessage('Invalid doctor ID'),
      query('patientId').optional().isMongoId().withMessage('Invalid patient ID'),
      query('status')
        .optional()
        .isIn(['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'])
        .withMessage('Invalid status filter'),
    ])
    .build(),

  // Get appointment by ID
  getById: new ValidatorBuilder().add([baseValidators.id('id', 'param')]).build(),

  // Add medical notes to appointment
  addMedicalNotes: new ValidatorBuilder()
    .add([
      baseValidators.id('id', 'param'),
      body('diagnosis').optional().trim().isLength({ max: 1000 }).withMessage('Diagnosis too long'),
      body('prescription')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Prescription too long'),
      body('notes').optional().trim().isLength({ max: 2000 }).withMessage('Notes too long'),
      body('followUpRequired')
        .optional()
        .isBoolean()
        .withMessage('followUpRequired must be a boolean'),
      body('followUpDate').optional().isISO8601().toDate().withMessage('Invalid follow-up date'),
    ])
    .build(),

  // Check availability
  checkAvailability: new ValidatorBuilder()
    .add([
      baseValidators.id('doctorId', 'query'),
      query('date').isISO8601().withMessage('Invalid date'),
      baseValidators.number('duration', { min: 15, max: 120 }),
    ])
    .build({ strict: true }),
};

// Register validators
validationRegistry.register('appointment:create', appointmentValidators.create as any);
validationRegistry.register('appointment:update', appointmentValidators.update as any);
validationRegistry.register('appointment:reschedule', appointmentValidators.reschedule as any);
