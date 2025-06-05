const express = require('express');
const router = express.Router();

const {
    createTask,
    getAllTasks,
    getTaskById,
    updateTask,
    assignTaskToCourse,
    unassignTaskFromCourse,
    updateTaskDueDate,
    deleteTask,
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


// Route to assign a task to a course
router.post('/:id/assign', authenticate, isTeacher, assignTaskToCourse);

// Route to unassign a task from a course
router.delete('/:id/unassign', authenticate, isTeacher, unassignTaskFromCourse);

// Route to update the due date of a task for a course
router.put('/:id/assign/:courseId', authenticate, isTeacher, updateTaskDueDate);

    // Export the router
module.exports = router;
