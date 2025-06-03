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
            errors: errors.array(),
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

        check('password')
            .optional()
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),

        validateResult,
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

        check('password')
            .optional()
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),

        validateResult,
    ],
};

/**
 * Lab resource validation
 */
const courseValidation = {
    // POST validation (creating a lab)
    create: [
        check('name')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Course name is required')
            .isLength({ min: 3, max: 100 })
            .withMessage('Name must be between 3 and 100 characters'),

        check('description')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Course description is required')
            .isLength({ min: 10, max: 500 })
            .withMessage('Description must be between 10 and 500 characters'),

        validateResult,
    ],

    // PUT/PATCH validation (updating a lab)
    update: [
        check('name')
            .optional()
            .trim()
            .not()
            .isEmpty()
            .withMessage('Course name is required')
            .isLength({ min: 3, max: 100 })
            .withMessage('Name must be between 3 and 100 characters'),

        check('description')
            .optional()
            .trim()
            .not()
            .isEmpty()
            .withMessage('Course description is required')
            .isLength({ min: 10, max: 500 })
            .withMessage('Description must be between 10 and 500 characters'),

        validateResult,
    ],

    // POST validation (enrolling in a course)
    enroll: [
        check('courseId')
            .isMongoId()
            .withMessage('Invalid course ID format')
            .not()
            .isEmpty()
            .withMessage('Course ID is required'),

        check('email')
            .isEmail()
            .withMessage('Please provide a valid email'),

        validateResult,
    ],
};

/**
 * Common resource ID validation
 */
const paramValidation = {
    // Validate resource ID in URL parameters
    resourceId: [
        check('id').isMongoId().withMessage('Invalid resource ID format'),
        validateResult,
    ],

    // Validate course ID in URL parameters
    courseId: [
        check('courseId').isMongoId().withMessage('Invalid course ID format'),
        validateResult,
    ],

    // Validate folder ID in URL parameters
    folderId: [
        check('folderId').isMongoId().withMessage('Invalid folder ID format'),
        validateResult,
    ],

    // Validate student ID in URL parameters
    studentId: [
        check('studentId').isMongoId().withMessage('Invalid student ID format'),
        validateResult,
    ],

    // Validate teacher ID in URL parameters
    teacherId: [
        check('teacherId').isMongoId().withMessage('Invalid teacher ID format'),
        validateResult,
    ],
};

module.exports = {
    userValidation,
    courseValidation,
    paramValidation,
};
