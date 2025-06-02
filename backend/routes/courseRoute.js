const express = require('express');

const router = express.Router();

const {
    getAllCourses, //
    getCourseById, //
    createCourse, //
    updateCourse, //
    deleteCourse, 
    enrollInCourse,
    unenrollFromCourse,
} = require('../controllers/CourseController');

const { authenticate, authorize } = require('../middleware/authMiddleware');
const {
    courseValidation,
    paramValidation,
} = require('../middleware/validationMiddleware');
const {
    checkRole,
    isAdmin,
    isStudent,
    isTeacher,
} = require('../middleware/roleMiddleware');

// List all courses
router
    .route('/')
    .get(authenticate, getAllCourses) // Public access to get all courses
    .post(authenticate, isTeacher, courseValidation.create, createCourse); // Teacher can create a course

// Single course operations
router
    .route('/:id')
    .get(authenticate, paramValidation.resourceId, getCourseById) // Public access to get course by ID
    .put(
        authenticate,
        isTeacher,
        paramValidation.resourceId,
        courseValidation.update,
        updateCourse
    ) // Teacher can update a course
    .delete(authenticate, isTeacher, paramValidation.resourceId, deleteCourse); // Teacher can delete a course

// Enroll in a course
router
    .route('/:id/enroll')
    .post(authenticate, isStudent, paramValidation.resourceId, enrollInCourse); // Students can enroll in a course

// Unenroll from a course
router
    .route('/:id/unenroll')
    .post(
        authenticate,
        isStudent,
        paramValidation.resourceId,
        unenrollFromCourse
    ); // Students can unenroll from a course

module.exports = router;
