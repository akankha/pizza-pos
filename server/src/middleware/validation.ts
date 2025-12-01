import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation error handler middleware
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'Validation failed',
      details: errors.array() 
    });
  }
  next();
};

// Login validation
export const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be 3-50 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 4 })
    .withMessage('Password must be at least 4 characters'),
  handleValidationErrors
];

// Order creation validation
export const validateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.name')
    .trim()
    .notEmpty()
    .withMessage('Item name is required')
    .isLength({ max: 255 })
    .withMessage('Item name too long'),
  body('items.*.price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('total')
    .isFloat({ min: 0 })
    .withMessage('Total must be a positive number'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'card'])
    .withMessage('Payment method must be cash or card'),
  handleValidationErrors
];

// Menu item validation
export const validateMenuItem = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 })
    .withMessage('Name too long')
    .matches(/^[a-zA-Z0-9\s\-_()]+$/)
    .withMessage('Name contains invalid characters'),
  body('price')
    .optional()
    .isFloat({ min: 0, max: 9999.99 })
    .withMessage('Price must be between 0 and 9999.99'),
  body('basePrice')
    .optional()
    .isFloat({ min: 0, max: 9999.99 })
    .withMessage('Base price must be between 0 and 9999.99'),
  body('priceModifier')
    .optional()
    .isFloat({ min: -99.99, max: 99.99 })
    .withMessage('Price modifier must be between -99.99 and 99.99'),
  handleValidationErrors
];

// ID parameter validation
export const validateId = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('ID is required')
    .matches(/^[a-zA-Z0-9\-]+$/)
    .withMessage('Invalid ID format'),
  handleValidationErrors
];

// Sanitize SQL dangerous characters (additional layer)
export const sanitizeSql = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    // Remove SQL injection attempts
    return str.replace(/[';-]/g, '');
  };

  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }

  // Sanitize query params
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizeString(req.query[key] as string);
      }
    });
  }

  next();
};
