// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const {
    getStudents,
    getTeachers,
    getUserById,
    updateUser,
    deleteUser,
    enrollInCourse,
} = require('../controllers/userController');

const { authenticate, authorize } = require('../middleware/authMiddleware');
const { userValidation, paramValidation } = require('../middleware/validationMiddleware');

// List and create users
router.route('/students')
    .get(authenticate, authorize('admin'), getStudents) // Admin can get all students;

router.route('/teachers')
    .get(authenticate, authorize('admin'), getTeachers) // Admin can get all teachers;
// Single user operations

router.route('/me')
    .get(
        authenticate,
        getUserById
    )
    .put(
        authenticate,
        userValidation.update,
        updateUser
    );

router.route('/:id')
    .get(
        authenticate,
        authorize('admin'),
        paramValidation.resourceId,
        getUserById
    )
    .put(
        authenticate,
        authorize('admin'),
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
router.route('/:id/enroll')
    .post(
        authenticate,
        paramValidation.resourceId,
        userValidation.enroll,
        enrollInCourse
    );


module.exports = router;