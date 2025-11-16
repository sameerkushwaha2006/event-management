export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  message: string;
}

export interface ValidationRules {
  [fieldName: string]: ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [fieldName: string]: string[] };
}

export const validateField = (value: string, rules: ValidationRule[]): string[] => {
  const errors: string[] = [];

  for (const rule of rules) {
    if (rule.required && (!value || value.trim() === '')) {
      errors.push(rule.message);
      continue;
    }

    if (!value) continue; // Skip other validations if field is empty and not required

    if (rule.minLength && value.length < rule.minLength) {
      errors.push(rule.message);
    }

    if (rule.maxLength && value.length > rule.maxLength) {
      errors.push(rule.message);
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.message);
    }
  }

  return errors;
};

export const validateForm = (data: { [fieldName: string]: string }, rules: ValidationRules): ValidationResult => {
  const errors: { [fieldName: string]: string[] } = {};
  let isValid = true;

  for (const fieldName in rules) {
    const fieldErrors = validateField(data[fieldName] || '', rules[fieldName]);
    if (fieldErrors.length > 0) {
      errors[fieldName] = fieldErrors;
      isValid = false;
    }
  }

  return { isValid, errors };
};

// Common validation rules
export const validationRules = {
  email: [
    {
      required: true,
      message: 'Email is required',
    },
    {
      pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: 'Please enter a valid email address',
    },
  ],
  password: [
    {
      required: true,
      message: 'Password is required',
    },
    {
      minLength: 8,
      message: 'Password must be at least 8 characters long',
    },
    {
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
    },
  ],
  name: [
    {
      required: true,
      message: 'Name is required',
    },
    {
      minLength: 2,
      message: 'Name must be at least 2 characters long',
    },
    {
      maxLength: 100,
      message: 'Name must not exceed 100 characters',
    },
  ],
  eventTitle: [
    {
      required: true,
      message: 'Event title is required',
    },
    {
      minLength: 3,
      message: 'Event title must be at least 3 characters long',
    },
    {
      maxLength: 200,
      message: 'Event title must not exceed 200 characters',
    },
  ],
  eventDescription: [
    {
      required: true,
      message: 'Event description is required',
    },
    {
      minLength: 10,
      message: 'Event description must be at least 10 characters long',
    },
    {
      maxLength: 2000,
      message: 'Event description must not exceed 2000 characters',
    },
  ],
  required: [
    {
      required: true,
      message: 'This field is required',
    },
  ],
  phone: [
    {
      pattern: /^\+?[\d\s\-\(\)]+$/,
      message: 'Please enter a valid phone number',
    },
  ],
  confirmPassword: (password: string) => [
    {
      required: true,
      message: 'Please confirm your password',
    },
    {
      // Custom validation will be handled in the component
      message: 'Passwords do not match',
    },
  ],
};