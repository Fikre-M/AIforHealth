// backend/src/middleware/validators/patient.validators.ts
import { body, param, query } from 'express-validator';
import { baseValidators } from './base.validators';
import { ValidatorBuilder, validationRegistry } from './index';

// Helper function
const calculateAge = (dateOfBirth: Date): number => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

export const patientValidators = {
  // Create new patient
  create: new ValidatorBuilder()
    .add([
      baseValidators.name('firstName'),
      baseValidators.name('lastName'),
      baseValidators.email('email'),
      baseValidators.phone('phone', true),

      // Date of Birth validation
      body('dateOfBirth')
        .isISO8601()
        .toDate()
        .custom((value) => {
          const age = calculateAge(value);
          if (age < 0 || age > 150) {
            throw new Error('Invalid date of birth');
          }
          if (age < 18) {
            throw new Error('Patient must be at least 18 years old');
          }
          return true;
        })
        .withMessage('Invalid date of birth'),

      // Gender validation
      body('gender')
        .isIn(['male', 'female', 'other', 'prefer-not-to-say'])
        .withMessage('Invalid gender'),

      // Blood type
      body('bloodType')
        .optional()
        .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
        .withMessage('Invalid blood type'),

      // Address validation
      body('address.street')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Street address too long'),
      body('address.city')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('City name too long'),
      body('address.state')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('State name too long'),
      body('address.zipCode')
        .optional()
        .matches(/^\d{5}(-\d{4})?$/)
        .withMessage('Invalid ZIP code format'),
      body('address.country')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Country name too long'),

      // Emergency contact
      body('emergencyContact.name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Emergency contact name must be 2-100 characters'),
      body('emergencyContact.phone')
        .optional()
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage('Invalid emergency contact phone'),
      body('emergencyContact.relationship')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Relationship too long'),

      // Insurance information
      body('insurance.provider')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Insurance provider too long'),
      body('insurance.policyNumber')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Policy number too long'),
      body('insurance.groupNumber')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Group number too long'),

      // Medical history
      body('medicalHistory').optional().isArray().withMessage('Medical history must be an array'),
      body('medicalHistory.*.condition')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Condition name too long'),
      body('medicalHistory.*.diagnosedDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid diagnosed date'),
      body('medicalHistory.*.status')
        .optional()
        .isIn(['active', 'resolved', 'ongoing'])
        .withMessage('Invalid condition status'),
      body('medicalHistory.*.notes')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Notes too long'),

      // Allergies
      body('allergies').optional().isArray().withMessage('Allergies must be an array'),
      body('allergies.*.allergen')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Allergen name too long'),
      body('allergies.*.severity')
        .optional()
        .isIn(['mild', 'moderate', 'severe', 'life-threatening'])
        .withMessage('Invalid severity'),
      body('allergies.*.reaction')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Reaction description too long'),

      // Medications
      body('medications').optional().isArray().withMessage('Medications must be an array'),
      body('medications.*.name')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Medication name too long'),
      body('medications.*.dosage')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Dosage too long'),
      body('medications.*.frequency')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Frequency too long'),
      body('medications.*.startDate').optional().isISO8601().withMessage('Invalid start date'),
      body('medications.*.endDate').optional().isISO8601().withMessage('Invalid end date'),

      // Primary care physician
      body('primaryCarePhysician').optional().isMongoId().withMessage('Invalid physician ID'),

      // Preferences
      body('preferences.contactMethod')
        .optional()
        .isIn(['email', 'phone', 'sms', 'mail'])
        .withMessage('Invalid contact method'),
      body('preferences.reminders')
        .optional()
        .isBoolean()
        .withMessage('reminders must be a boolean'),
      body('preferences.language')
        .optional()
        .trim()
        .isLength({ max: 50 })
        .withMessage('Language too long'),
    ])
    .build(),

  // Update patient
  update: new ValidatorBuilder()
    .add([
      baseValidators.id('id', 'param'),
      body('firstName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('First name must be 2-100 characters'),
      body('lastName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Last name must be 2-100 characters'),
      baseValidators.phone('phone', false),
      body('email').optional().isEmail().normalizeEmail().withMessage('Invalid email'),

      // Address updates
      body('address.street').optional().trim().isLength({ max: 200 }),
      body('address.city').optional().trim().isLength({ max: 100 }),
      body('address.state').optional().trim().isLength({ max: 50 }),
      body('address.zipCode')
        .optional()
        .matches(/^\d{5}(-\d{4})?$/)
        .withMessage('Invalid ZIP code'),

      // Emergency contact updates
      body('emergencyContact.name').optional().trim().isLength({ min: 2, max: 100 }),
      body('emergencyContact.phone')
        .optional()
        .matches(/^\+?[1-9]\d{1,14}$/)
        .withMessage('Invalid phone number'),

      // Insurance updates
      body('insurance.provider').optional().trim().isLength({ max: 100 }),
      body('insurance.policyNumber').optional().trim().isLength({ max: 50 }),
    ])
    .build(),

  // List patients with filters
  list: new ValidatorBuilder()
    .add([
      ...Object.values(baseValidators.pagination),
      query('search')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('Search term must be at least 2 characters'),
      query('gender')
        .optional()
        .isIn(['male', 'female', 'other'])
        .withMessage('Invalid gender filter'),
      query('bloodType')
        .optional()
        .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
        .withMessage('Invalid blood type'),
      query('ageMin')
        .optional()
        .isInt({ min: 0, max: 150 })
        .toInt()
        .withMessage('Invalid minimum age'),
      query('ageMax')
        .optional()
        .isInt({ min: 0, max: 150 })
        .toInt()
        .withMessage('Invalid maximum age'),
      query('primaryCarePhysician').optional().isMongoId().withMessage('Invalid physician ID'),
      query('hasInsurance')
        .optional()
        .isBoolean()
        .toBoolean()
        .withMessage('hasInsurance must be a boolean'),
    ])
    .build(),

  // Get patient by ID
  getById: new ValidatorBuilder().add([baseValidators.id('id', 'param')]).build(),

  // Add medical record
  addMedicalRecord: new ValidatorBuilder()
    .add([
      baseValidators.id('id', 'param'),
      body('type')
        .isIn(['diagnosis', 'prescription', 'lab_result', 'imaging', 'vaccination', 'note'])
        .withMessage('Invalid record type'),
      body('title').trim().notEmpty().isLength({ max: 200 }).withMessage('Title too long'),
      body('description')
        .optional()
        .trim()
        .isLength({ max: 2000 })
        .withMessage('Description too long'),
      body('date').isISO8601().toDate().withMessage('Invalid date'),
      body('provider').optional().isMongoId().withMessage('Invalid provider ID'),
      body('attachments').optional().isArray().withMessage('Attachments must be an array'),
      body('attachments.*.url').optional().isURL().withMessage('Invalid attachment URL'),
      body('attachments.*.type')
        .optional()
        .isIn(['pdf', 'image', 'lab_report'])
        .withMessage('Invalid attachment type'),
    ])
    .build(),

  // Add appointment history
  addAppointment: new ValidatorBuilder()
    .add([
      baseValidators.id('id', 'param'),
      body('appointmentId').isMongoId().withMessage('Invalid appointment ID'),
      body('notes').optional().trim().isLength({ max: 500 }),
    ])
    .build(),
};

// Register validators
validationRegistry.register('patient:create', patientValidators.create as any);
validationRegistry.register('patient:update', patientValidators.update as any);
validationRegistry.register('patient:list', patientValidators.list as any);
