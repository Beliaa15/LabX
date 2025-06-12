const express = require('express');

const router = express.Router();

const {
    getStudents,
    getTeachers,
    getUserById,
    updateUser,
    deleteUser,
    // Add these new functions
    getAllUsers,
    updateUserRole
} = require('../controllers/userController');

const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
    userValidation,
    paramValidation,
} = require('../middleware/validationMiddleware');
const {
    checkRole,
    isAdmin,
    isStudent,
    isTeacher,
} = require('../middleware/roleMiddleware');

// List and create users
router.route('/students').get(authenticate, isAdmin, getStudents); // Admin can get all students;

router.route('/teachers').get(authenticate, isAdmin, getTeachers); // Admin can get all teachers;

// Add new admin routes
router.route('/').get(authenticate, isAdmin, getAllUsers); // Admin can get all users

// Single user operations
router
    .route('/me')
    .get(authenticate, getUserById)
    .put(authenticate, userValidation.update, updateUser);

router
    .route('/:id')
    .get(authenticate, isAdmin, paramValidation.resourceId, getUserById)
    .put(
        authenticate,
        isAdmin,
        paramValidation.resourceId,
        userValidation.update,
        updateUser
    )
    .delete(authenticate, isAdmin, paramValidation.resourceId, deleteUser);

// Add route for updating user role
router
    .route('/:id/role')
    .put(authenticate, isAdmin, paramValidation.resourceId, updateUserRole);

module.exports = router;
