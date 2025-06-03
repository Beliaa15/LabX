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
    enrollStudentByEmail,
    unenrollStudentByEmail,
    getCoursesForUser,
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

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management and enrollment
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         teacher:
 *           type: string
 *         code:
 *           type: string
 *         students:
 *           type: array
 *           items:
 *             type: string
 *         tasks:
 *           type: array
 *           items:
 *             type: string
 *     CourseCreate:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *     CourseEnrollByCode:
 *       type: object
 *       required:
 *         - code
 *       properties:
 *         code:
 *           type: string
 *     CourseEnrollByEmail:
 *       type: object
 *       required:
 *         - courseId
 *         - email
 *       properties:
 *         courseId:
 *           type: string
 *         email:
 *           type: string
 */

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseCreate'
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /courses/me:
 *   get:
 *     summary: Get courses for the authenticated user
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 *   put:
 *     summary: Update a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseCreate'
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course not found
 *   delete:
 *     summary: Delete a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course removed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /courses/enroll:
 *   post:
 *     summary: Enroll in a course by code (student only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseEnrollByCode'
 *     responses:
 *       200:
 *         description: User enrolled in course successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /courses/unenroll:
 *   post:
 *     summary: Unenroll from a course by code (student only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseEnrollByCode'
 *     responses:
 *       200:
 *         description: User unenrolled from course successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Course not found
 */

/**
 * @swagger
 * /courses/enroll-email:
 *   post:
 *     summary: Enroll a student by email (teacher only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseEnrollByEmail'
 *     responses:
 *       200:
 *         description: Student enrolled in course successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course or student not found
 */

/**
 * @swagger
 * /courses/unenroll-email:
 *   post:
 *     summary: Unenroll a student by email (teacher only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseEnrollByEmail'
 *     responses:
 *       200:
 *         description: Student unenrolled from course successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Course or student not found
 */

// List all courses
router
    .route('/')
    .get(authenticate, getAllCourses) // Public access to get all courses
    .post(authenticate, isTeacher, courseValidation.create, createCourse); // Teacher can create a course

// Get courses for the authenticated user
router.route('/me').get(
    authenticate,
    getCoursesForUser
);

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
    .route('/enroll')
    .post(authenticate, isStudent, enrollInCourse); // Students can enroll in a course via code

// Unenroll from a course
router
    .route('/unenroll')
    .post(
        authenticate,
        isStudent,
        unenrollFromCourse
    ); // Students can unenroll from a course


// Enroll student by email (only for teachers)
router.route('/enroll-email')
    .post(
        authenticate,
        isTeacher,
        courseValidation.enroll,
        enrollStudentByEmail
    ); // Teachers can enroll students by email

// Unenroll student by email (only for teachers)
router.route('/unenroll-email')
    .post(
        authenticate,
        isTeacher,
        courseValidation.enroll,
        unenrollStudentByEmail
    ); // Teachers can unenroll students by email
    
module.exports = router;
