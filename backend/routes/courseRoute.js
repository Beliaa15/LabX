const express = require('express');
const multer = require('multer');
const upload = require('../config/multer');
const router = express.Router();

const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    unenrollFromCourse,
    enrollStudentByEmail,
    unenrollStudentByEmail,
    getCoursesForUser,
} = require('../controllers/CourseController');

const {
    createFolder,
    getFolders,
    getFolderById,
    deleteFolder,
    updateFolder,
} = require('../controllers/folderController');

const {
    addMaterial,
    getMaterials,
    getMaterialById,
    downloadMaterial,
    deleteMaterial,
} = require('../controllers/materialController');

const {
    submitTask,
    updateSubmission,
    getTaskSubmissions,
} = require('../controllers/submissionController');

const { getTasksByCourse } = require('../controllers/taskController');

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

// Get courses for the authenticated user
router.route('/me').get(authenticate, getCoursesForUser);

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
router.route('/enroll').post(authenticate, isStudent, enrollInCourse); // Students can enroll in a course via code

// Unenroll from a course
router.route('/unenroll').post(authenticate, isStudent, unenrollFromCourse); // Students can unenroll from a course

// Enroll student by email (only for teachers)
router
    .route('/enroll-email')
    .post(
        authenticate,
        isTeacher,
        courseValidation.enroll,
        enrollStudentByEmail
    ); // Teachers can enroll students by email

// Unenroll student by email (only for teachers)
router
    .route('/unenroll-email')
    .post(
        authenticate,
        isTeacher,
        courseValidation.enroll,
        unenrollStudentByEmail
    ); // Teachers can unenroll students by email

// Folder operations within a course
router
    .route('/:courseId/folders')
    .post(authenticate, isTeacher, paramValidation.courseId, createFolder) // Teacher can create a folder in a course
    .get(authenticate, paramValidation.courseId, getFolders); // Students and teachers can view folders in a course

// Single folder operations
router
    .route('/:courseId/folders/:folderId')
    .get(authenticate, paramValidation.courseId, getFolderById) // Get a specific folder by ID
    .put(authenticate, isTeacher, paramValidation.courseId, updateFolder) // Teacher can update a folder
    .delete(authenticate, isTeacher, paramValidation.courseId, deleteFolder); // Teacher can delete a folder

router.post(
    '/:courseId/folders/:folderId/materials',
    authenticate,
    isTeacher,
    paramValidation.courseId,
    paramValidation.folderId,
    upload.single('file'), // Use multer to handle file uploads
    addMaterial
); // Teacher can add materials to a folder in a course

router.get(
    '/:courseId/folders/:folderId/materials',
    authenticate,
    paramValidation.courseId,
    paramValidation.folderId,
    getMaterials
); // Get all materials in a folder

router.get(
    '/:courseId/folders/:folderId/materials/:materialId',
    authenticate,
    paramValidation.courseId,
    paramValidation.folderId,
    getMaterialById
); // Get a single material by ID

router.get(
    '/:courseId/folders/:folderId/materials/:materialId/download',
    authenticate,
    paramValidation.courseId,
    paramValidation.folderId,
    downloadMaterial
); // Download a material by ID

router.delete(
    '/:courseId/folders/:folderId/materials/:materialId',
    authenticate,
    isTeacher,
    paramValidation.courseId,
    paramValidation.folderId,
    deleteMaterial
);

router.get(
    '/:courseId/tasks',
    authenticate,
    paramValidation.courseId,
    getTasksByCourse
); // Get all tasks assigned to a course

// Route to submit a task
router.post(
    '/:courseId/tasks/:taskId/submit',
    authenticate,
    isStudent,
    paramValidation.courseId,
    paramValidation.taskId,
    submitTask
);

// Route to update a submission
router.put(
    '/:courseId/tasks/:taskId/submit',
    authenticate,
    isStudent,
    paramValidation.courseId,
    paramValidation.taskId,
    updateSubmission
);

// Route to get all submissions for a task
router.get(
    '/:courseId/tasks/:taskId/submissions',
    authenticate,
    isTeacher,
    paramValidation.courseId,
    paramValidation.taskId,
    getTaskSubmissions
);

module.exports = router;
