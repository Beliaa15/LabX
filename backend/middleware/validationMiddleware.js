const { check, validationResult } = require('express-validator');

/**
 * Common validation result handler
 * Returns 400 Bad Request for validation errors
 */
const validateResult = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            status: 'error',
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

/**
 * User resource validation
 */
const userValidation = {
    // POST validation (creating a user)
    create: [
        check('email')
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail(),

        check('name')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Name is required')
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters'),

        check('year')
            .isInt({ min: 1900, max: new Date().getFullYear() })
            .withMessage('Please provide a valid year'),

        check('password')
            .optional()
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),

        validateResult
    ],

    // PUT/PATCH validation (updating a user)
    update: [
        check('email')
            .optional()
            .isEmail()
            .withMessage('Please provide a valid email')
            .normalizeEmail(),

        check('name')
            .optional()
            .trim()
            .not()
            .isEmpty()
            .withMessage('Name cannot be empty if provided')
            .isLength({ min: 2, max: 50 })
            .withMessage('Name must be between 2 and 50 characters'),

        check('year')
            .optional()
            .isInt({ min: 1900, max: new Date().getFullYear() })
            .withMessage('Please provide a valid year'),

        check('password')
            .optional()
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),

        validateResult
    ],

    // Resource relationship validations
    enroll: [
        check('labId')
            .isMongoId()
            .withMessage('Invalid lab ID format'),
        validateResult
    ],

    addTeaching: [
        check('labId')
            .isMongoId()
            .withMessage('Invalid lab ID format'),
        validateResult
    ]
};

/**
 * Lab resource validation
 */
const labValidation = {
    // POST validation (creating a lab)
    create: [
        check('title')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Lab title is required')
            .isLength({ min: 3, max: 100 })
            .withMessage('Title must be between 3 and 100 characters'),

        check('startDate')
            .isISO8601()
            .withMessage('Start date must be a valid date'),

        check('deadline')
            .isISO8601()
            .withMessage('Deadline must be a valid date')
            .custom((value, { req }) => {
                if (new Date(value) <= new Date(req.body.startDate)) {
                    throw new Error('Deadline must be after start date');
                }
                return true;
            }),

        check('filePath')
            .trim()
            .not()
            .isEmpty()
            .withMessage('File path is required'),

        validateResult
    ],

    // PUT/PATCH validation (updating a lab)
    update: [
        check('title')
            .optional()
            .trim()
            .not()
            .isEmpty()
            .withMessage('Title cannot be empty if provided')
            .isLength({ min: 3, max: 100 })
            .withMessage('Title must be between 3 and 100 characters'),

        check('startDate')
            .optional()
            .isISO8601()
            .withMessage('Start date must be a valid date'),

        check('deadline')
            .optional()
            .isISO8601()
            .withMessage('Deadline must be a valid date')
            .custom((value, { req }) => {
                if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
                    throw new Error('Deadline must be after start date');
                }
                return true;
            }),

        check('filePath')
            .optional()
            .trim()
            .not()
            .isEmpty()
            .withMessage('File path cannot be empty if provided'),

        validateResult
    ],

    // Resource relationship validations
    addStudent: [
        check('studentId')
            .isMongoId()
            .withMessage('Invalid student ID format'),
        validateResult
    ],

    addTeacher: [
        check('teacherId')
            .isMongoId()
            .withMessage('Invalid teacher ID format'),
        validateResult
    ]
};

/**
 * Common resource ID validation
 */
const paramValidation = {
    // Validate resource ID in URL parameters
    resourceId: [
        check('id')
            .isMongoId()
            .withMessage('Invalid resource ID format'),
        validateResult
    ],

    // Validate student ID in URL parameters
    studentId: [
        check('studentId')
            .isMongoId()
            .withMessage('Invalid student ID format'),
        validateResult
    ],

    // Validate teacher ID in URL parameters
    teacherId: [
        check('teacherId')
            .isMongoId()
            .withMessage('Invalid teacher ID format'),
        validateResult
    ]
};

module.exports = {
    userValidation,
    labValidation,
    paramValidation
};