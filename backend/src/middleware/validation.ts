import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { createError } from './errorHandler';

// Handle validation errors
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    throw createError(errorMessages.join(', '), 400);
  }

  next();
};

// User registration validation
export const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  handleValidationErrors
];

// User login validation
export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Event creation validation
export const validateEventCreation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Event title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Event description must be between 50 and 5000 characters'),
  body('category')
    .isIn([
      'business', 'technology', 'education', 'entertainment', 'sports',
      'music', 'food', 'art', 'health', 'charity', 'networking',
      'workshop', 'conference', 'meetup', 'other'
    ])
    .withMessage('Please provide a valid event category'),
  body('eventType')
    .isIn(['in-person', 'virtual', 'hybrid'])
    .withMessage('Event type must be one of: in-person, virtual, hybrid'),
  body('startDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid end date'),
  body('price')
    .isFloat({ min: 0, max: 999999.99 })
    .withMessage('Price must be between 0 and 999,999.99'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'])
    .withMessage('Please provide a valid currency'),
  body('maxAttendees')
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage('Maximum attendees must be between 1 and 100,000'),
  body('tags')
    .optional()
    .isArray({ max: 10 })
    .withMessage('Cannot have more than 10 tags'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  // Conditional validation based on event type
  body('location.venue')
    .if(body('eventType').equals('in-person'))
    .notEmpty()
    .withMessage('Venue is required for in-person events'),
  body('location.address')
    .if(body('eventType').equals('in-person'))
    .notEmpty()
    .withMessage('Address is required for in-person events'),
  body('virtualLink')
    .if(body('eventType').equals('virtual'))
    .isURL()
    .withMessage('Virtual link is required for virtual events'),
  handleValidationErrors
];

// Event update validation
export const validateEventUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Event title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 5000 })
    .withMessage('Event description must be between 50 and 5000 characters'),
  body('category')
    .optional()
    .isIn([
      'business', 'technology', 'education', 'entertainment', 'sports',
      'music', 'food', 'art', 'health', 'charity', 'networking',
      'workshop', 'conference', 'meetup', 'other'
    ])
    .withMessage('Please provide a valid event category'),
  body('startDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Please provide a valid end date'),
  body('price')
    .optional()
    .isFloat({ min: 0, max: 999999.99 })
    .withMessage('Price must be between 0 and 999,999.99'),
  body('maxAttendees')
    .optional()
    .isInt({ min: 1, max: 100000 })
    .withMessage('Maximum attendees must be between 1 and 100,000'),
  handleValidationErrors
];

// Registration validation
export const validateEventRegistration = [
  body('ticketQuantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Ticket quantity must be between 1 and 10'),
  body('attendeeInfo.firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('attendeeInfo.lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('attendeeInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('attendeeInfo.phone')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Phone number cannot exceed 20 characters'),
  body('attendeeInfo.specialRequirements')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Special requirements cannot exceed 500 characters'),
  handleValidationErrors
];

// Payment intent validation
export const validatePaymentIntent = [
  body('eventId')
    .isMongoId()
    .withMessage('Please provide a valid event ID'),
  body('ticketQuantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Ticket quantity must be between 1 and 10'),
  body('attendeeInfo.firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('attendeeInfo.lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('attendeeInfo.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  handleValidationErrors
];

// MongoDB ObjectId validation
export const validateObjectId = (paramName: string) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Please provide a valid ${paramName}`),
  handleValidationErrors
];

// Query parameters validation
export const validateEventQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isIn([
      'business', 'technology', 'education', 'entertainment', 'sports',
      'music', 'food', 'art', 'health', 'charity', 'networking',
      'workshop', 'conference', 'meetup', 'other'
    ])
    .withMessage('Please provide a valid category'),
  query('eventType')
    .optional()
    .isIn(['in-person', 'virtual', 'hybrid'])
    .withMessage('Event type must be one of: in-person, virtual, hybrid'),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  handleValidationErrors
];

// Password reset validation
export const validatePasswordReset = [
  body('token')
    .notEmpty()
    .withMessage('Reset token is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  handleValidationErrors
];

// Forgot password validation
export const validateForgotPassword = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  handleValidationErrors
];

// Profile update validation
export const validateProfileUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('preferences.emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications preference must be a boolean'),
  body('preferences.eventReminders')
    .optional()
    .isBoolean()
    .withMessage('Event reminders preference must be a boolean'),
  handleValidationErrors
];