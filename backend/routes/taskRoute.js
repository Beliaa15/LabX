const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const zipUpload = require('../config/zipMulter');

const {
    createTask,
    uploadWebGLFiles,
    uploadSingleWebGLFile,
    uploadZipFile,
    getAllTasks,
    getTaskById,
    updateTask,
    assignTaskToCourse,
    unassignTaskFromCourse,
    updateTaskDueDate,
    deleteTask,
    getWebGLInfo,
    getWebGLFiles
} = require('../controllers/taskController');

const { authenticate } = require('../middleware/authMiddleware');

const {
    isAdmin,
    isStudent,
    isTeacher,
} = require('../middleware/roleMiddleware');

// const {} = require('../middleware/validateMiddleware');

// Route to create a new task
router
    .route('/')
    .post(authenticate, isAdmin, createTask)
    .get(authenticate, isTeacher, getAllTasks);

// Route to get a task by ID
router
    .route('/:id')
    .get(authenticate, isTeacher, getTaskById)
    .put(authenticate, isAdmin, updateTask)
    .delete(authenticate, isAdmin, deleteTask);


router.post('/:id/upload', authenticate, isAdmin, uploadWebGLFiles);

router.post('/:id/upload-zip', authenticate, isAdmin, zipUpload.single('file'), uploadZipFile);

router.post('/:id/upload/:fileType', authenticate, isAdmin, uploadSingleWebGLFile);

// Route to assign a task to a course
router.post('/:id/assign', authenticate, isTeacher, assignTaskToCourse);

// Route to unassign a task from a course
router.delete('/:id/unassign', authenticate, isTeacher, unassignTaskFromCourse);

// Route to update the due date of a task for a course
router.put('/:id/assign/:courseId', authenticate, isTeacher, updateTaskDueDate);

// Route to get WebGL info and files for a specific task
router.get('/:id/webgl-info', authenticate, getWebGLInfo);

// Route to get WebGL files for a specific task and file type
router.get('/:id/webgl-files/:fileType', authenticate, getWebGLFiles);

// Export the router
module.exports = router;
