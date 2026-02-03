export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export function validateField(value: string, rules: ValidationRule): string | null {
  if (rules.required && !value.trim()) {
    return 'This field is required';
  }

  if (value && rules.minLength && value.length < rules.minLength) {
    return `Must be at least ${rules.minLength} characters`;
  }

  if (value && rules.maxLength && value.length > rules.maxLength) {
    return `Must be no more than ${rules.maxLength} characters`;
  }

  if (value && rules.pattern && !rules.pattern.test(value)) {
    return 'Invalid format';
  }

  if (value && rules.custom) {
    return rules.custom(value);
  }

  return null;
}

export function validateForm(data: Record<string, any>, rules: ValidationRules): Record<string, string> {
  const errors: Record<string, string> = {};

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const stringValue = typeof value === 'string' ? value : String(value || '');
    const error = validateField(stringValue, rules[field]);
    if (error) {
      errors[field] = error;
    }
  });

  return errors;
}

// Common validation rules
export const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    custom: (value: string) => {
      if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Please enter a valid email address';
      }
      return null;
    }
  },
  password: {
    required: true,
    minLength: 8,
    custom: (value: string) => {
      if (value && value.length < 8) {
        return 'Password must be at least 8 characters';
      }
      if (value && !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(value)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)';
      }
      return null;
    }
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z\s]+$/,
    custom: (value: string) => {
      if (value && !/^[a-zA-Z\s]+$/.test(value)) {
        return 'Name can only contain letters and spaces';
      }
      return null;
    }
  },
  phone: {
    pattern: /^\+?[\d\s\-\(\)]+$/,
    custom: (value: string) => {
      if (value && !/^\+?[\d\s\-\(\)]+$/.test(value)) {
        return 'Please enter a valid phone number';
      }
      return null;
    }
  },
  specialization: {
    required: true,
    minLength: 2,
    maxLength: 50,
    custom: (value: string) => {
      if (!value || value.trim().length === 0) {
        return 'Specialization is required for doctors';
      }
      return null;
    }
  },
  licenseNumber: {
    required: true,
    minLength: 3,
    maxLength: 20,
    custom: (value: string) => {
      if (!value || value.trim().length === 0) {
        return 'License number is required for doctors';
      }
      return null;
    }
  }
};