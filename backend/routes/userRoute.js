// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    enrollInLab,
    addTeachingLab
} = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { userValidation, paramValidation } = require('../middleware/validationMiddleware');

// List and create users
router.route('/')
    .get(authenticate, authorize('admin'), getUsers);

// Single user operations
router.route('/:id')
    .get(
        authenticate,
        paramValidation.resourceId,
        getUserById
    )
    .put(
        authenticate,
        paramValidation.resourceId,
        userValidation.update,
        updateUser
    )
    .delete(
        authenticate,
        authorize('admin'),
        paramValidation.resourceId,
        deleteUser
    );

// Lab enrollments (user-lab relationship)
router.route('/:id/enrollments')
    .post(
        authenticate,
        paramValidation.resourceId,
        userValidation.enroll,
        enrollInLab
    );

// Teaching assignments (user-lab relationship for teachers)
router.route('/:id/teaching')
    .post(
        authenticate,
        authorize(['teacher', 'admin']),
        paramValidation.resourceId,
        userValidation.addTeaching,
        addTeachingLab
    );

module.exports = router;