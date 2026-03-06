# Input Validation Guide

## Overview

The application uses `express-validator` for comprehensive input validation with custom middleware for error handling.

## Quick Start

### Using Pre-built Validators

```typescript
import { validateAppointmentCreation } from '@/middleware/validation';

router.post('/appointments', 
  authenticate,
  validateAppointmentCreation,
  AppointmentController.create
);
```

### Using Generic Validator

```typescript
import { validate } from '@/middleware/validation';
import { body } from 'express-validator';

router.post('/custom', 
  validate([
    body('email').isEmail(),
    body('name').notEmpty().isLength({ min: 2, max: 50 }),
    body('age').isInt({ min: 0, max: 120 })
  ]),
  controller.method
);
```

## Available Pre-built Validators

### Authentication
- `validateUserRegistration` - Name, email, password, role, doctor fields
- `validateUserLogin` - Email and password
- `validatePasswordUpdate` - Current, new, and confirmation passwords
- `validatePasswordResetRequest` - Email validation
- `validatePasswordReset` - Token and new password
- `validateUserProfileUpdate` - Name and email updates

### Appointments
- `validateAppointmentCreation` - Doctor, date, duration, type, reason
- `validateAppointmentUpdate` - All appointment fields
- `validateAppointmentCancellation` - Cancellation reason
- `validateAppointmentReschedule` - New date and reason
- `validateAppointmentCompletion` - Notes, prescription, diagnosis

### Patients
- `validatePatientCreation` - Full patient data validation

### Utilities
- `validateDateRange` - Start and end date validation
- `validatePagination` - Page and limit parameters
- `validateSearch` - Search query with sorting

## Custom Validators

### ValidationUtil Methods

```typescript
import { ValidationUtil } from '@/utils/validation';

// Validate MongoDB ObjectId
ValidationUtil.validateObjectId('userId')

// Validate phone number
ValidationUtil.validatePhone('phoneNumber')

// Validate date range
ValidationUtil.validateDateRange()

// Validate pagination
ValidationUtil.validatePagination()

// Validate search
ValidationUtil.validateSearch()
```

## Validation Rules

### User Registration
- Name: 2-50 chars, letters and spaces only
- Email: Valid email format, max 100 chars
- Password: 8-128 chars, must contain uppercase, lowercase, number, special char
- Role: patient, doctor, or admin
- Doctor fields: Required if role is doctor

### Appointments
- Doctor ID: Valid MongoDB ObjectId
- Date: ISO8601 format, must be in future
- Duration: 15-240 minutes
- Type: consultation, followup, emergency, checkup
- Reason: 5-500 characters
- Notes: Max 1000 characters

### Dates
- All dates must be ISO8601 format
- Appointment dates must be in future
- Date of birth must be in past
- End date must be after start date

### Pagination
- Page: Positive integer, default 1
- Limit: 1-100, default 20

## Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "errors": [
      {
        "field": "email",
        "message": "Please provide a valid email address",
        "value": "invalid-email"
      }
    ]
  }
}
```

## Best Practices

1. Always validate user input before processing
2. Use pre-built validators when available
3. Sanitize input (trim, normalize) before validation
4. Provide clear, user-friendly error messages
5. Validate both format and business rules
6. Use custom validators for complex logic
7. Chain validators for comprehensive checks

## Examples

### Custom Route Validation

```typescript
router.post('/doctors/:id/patients',
  authenticate,
  authorize(UserRole.DOCTOR),
  validate([
    body('name').trim().isLength({ min: 2, max: 50 }),
    body('email').isEmail().normalizeEmail(),
    body('dateOfBirth').isISO8601().custom((value) => {
      if (new Date(value) >= new Date()) {
        throw new Error('Date of birth must be in the past');
      }
      return true;
    })
  ]),
  DoctorController.createPatient
);
```

### Conditional Validation

```typescript
validate([
  body('type').isIn(['consultation', 'emergency']),
  body('emergencyReason')
    .if(body('type').equals('emergency'))
    .notEmpty()
    .withMessage('Emergency reason is required for emergency appointments')
])
```

### Array Validation

```typescript
validate([
  body('symptoms').isArray().withMessage('Symptoms must be an array'),
  body('symptoms.*').isLength({ max: 100 })
])
```

## Testing Validation

```typescript
describe('Validation', () => {
  it('should reject invalid email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'invalid', password: 'Test123!' });
    
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
```
