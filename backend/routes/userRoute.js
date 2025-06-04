const express = require('express');

const router = express.Router();

const {
    getStudents,
    getTeachers,
    getUserById,
    updateUser,
    deleteUser,
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

module.exports = router;
