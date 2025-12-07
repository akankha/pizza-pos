"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeSql = exports.validateId = exports.validateMenuItem = exports.validateOrder = exports.validateLogin = exports.handleValidationErrors = void 0;
const express_validator_1 = require("express-validator");
// Validation error handler middleware
const handleValidationErrors = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};
exports.handleValidationErrors = handleValidationErrors;
// Login validation
exports.validateLogin = [
    (0, express_validator_1.body)('username')
        .trim()
        .notEmpty()
        .withMessage('Username is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be 3-50 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 4 })
        .withMessage('Password must be at least 4 characters'),
    exports.handleValidationErrors
];
// Order creation validation
exports.validateOrder = [
    (0, express_validator_1.body)('items')
        .isArray({ min: 1 })
        .withMessage('Order must contain at least one item'),
    (0, express_validator_1.body)('items.*.name')
        .trim()
        .notEmpty()
        .withMessage('Item name is required')
        .isLength({ max: 255 })
        .withMessage('Item name too long'),
    (0, express_validator_1.body)('items.*.price')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('items.*.quantity')
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1'),
    (0, express_validator_1.body)('total')
        .isFloat({ min: 0 })
        .withMessage('Total must be a positive number'),
    (0, express_validator_1.body)('paymentMethod')
        .optional()
        .isIn(['cash', 'card'])
        .withMessage('Payment method must be cash or card'),
    exports.handleValidationErrors
];
// Menu item validation
exports.validateMenuItem = [
    (0, express_validator_1.body)('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required')
        .isLength({ max: 255 })
        .withMessage('Name too long')
        .matches(/^[a-zA-Z0-9\s\-_()]+$/)
        .withMessage('Name contains invalid characters'),
    (0, express_validator_1.body)('price')
        .optional()
        .isFloat({ min: 0, max: 9999.99 })
        .withMessage('Price must be between 0 and 9999.99'),
    (0, express_validator_1.body)('basePrice')
        .optional()
        .isFloat({ min: 0, max: 9999.99 })
        .withMessage('Base price must be between 0 and 9999.99'),
    (0, express_validator_1.body)('priceModifier')
        .optional()
        .isFloat({ min: -99.99, max: 99.99 })
        .withMessage('Price modifier must be between -99.99 and 99.99'),
    exports.handleValidationErrors
];
// ID parameter validation
exports.validateId = [
    (0, express_validator_1.param)('id')
        .trim()
        .notEmpty()
        .withMessage('ID is required')
        .matches(/^[a-zA-Z0-9\-]+$/)
        .withMessage('Invalid ID format'),
    exports.handleValidationErrors
];
// Sanitize SQL dangerous characters (additional layer)
const sanitizeSql = (req, res, next) => {
    const sanitizeString = (str) => {
        if (typeof str !== 'string')
            return str;
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
                req.query[key] = sanitizeString(req.query[key]);
            }
        });
    }
    next();
};
exports.sanitizeSql = sanitizeSql;
