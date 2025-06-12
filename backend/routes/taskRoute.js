const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const {
    createTask,
    uploadWebGLFiles,
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


router.post('/:id/upload', authenticate, isAdmin, uploadWebGLFiles);

// Route to assign a task to a course
router.post('/:id/assign', authenticate, isTeacher, assignTaskToCourse);

// Route to unassign a task from a course
router.delete('/:id/unassign', authenticate, isTeacher, unassignTaskFromCourse);

// Route to update the due date of a task for a course
router.put('/:id/assign/:courseId', authenticate, isTeacher, updateTaskDueDate);

router.get('/:id/webgl-info', authenticate, async (req, res) => {
    try {
        const { id: taskId } = req.params;
        
        const Task = require('../models/Task');
        const task = await Task.findById(taskId);
        
        if (!task) {
            return res.status(404).json({ 
                success: false, 
                message: 'Task not found' 
            });
        }

        if (!task.webglData.loader || !task.webglData.data) {
            return res.status(404).json({
                success: false,
                message: 'No WebGL build found for this task'
            });
        }

        res.status(200).json({
            success: true,
            webglData: {
                hasFiles: true,
                files: {
                    loader: task.webglData.loader ? path.basename(task.webglData.loader) : null,
                    data: task.webglData.data ? path.basename(task.webglData.data) : null,
                    framework: task.webglData.framework ? path.basename(task.webglData.framework) : null,
                    wasm: task.webglData.wasm ? path.basename(task.webglData.wasm) : null,
                }
            }
        });

    } catch (error) {
        console.error('Error getting WebGL info:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

router.get('/:id/webgl-files/:fileType', async (req, res) => {
    try {
        const { id: taskId, fileType } = req.params;
        
        const Task = require('../models/Task');
        const task = await Task.findById(taskId);
        
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        const validFileTypes = ['loader', 'data', 'framework', 'wasm'];
        if (!validFileTypes.includes(fileType)) {
            return res.status(400).json({ message: 'Invalid file type' });
        }

        const filePath = task.webglData[fileType];
        if (!filePath || !fs.existsSync(filePath)) {
            return res.status(404).json({ message: `${fileType} file not found` });
        }

        // Set appropriate headers
        const filename = path.basename(filePath);
        const ext = path.extname(filename).toLowerCase();

        if (ext === '.js') {
            res.setHeader('Content-Type', 'application/javascript');
        } else if (ext === '.wasm') {
            res.setHeader('Content-Type', 'application/wasm');
            console.log('Serving WebAssembly file:', filename);
        } else if (ext === '.data') {
            res.setHeader('Content-Type', 'application/octet-stream');
            console.log('Serving data file:', filename);
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.sendFile(path.resolve(filePath));

    } catch (error) {
        console.error('Error serving WebGL file:', error);
        res.status(500).json({ message: 'Error serving file' });
    }
});

    // Export the router
module.exports = router;
