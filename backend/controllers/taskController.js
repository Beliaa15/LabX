const Task = require('../models/Task');
const Course = require('../models/Course');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const createWebGLStorage = require('../config/webglMulter');
const fs = require('fs');
const path = require('path');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private/Admin
exports.createTask = asyncHandler(async (req, res) => {
    const { title, description, score } = req.body;

    const task = new Task({
        title,
        description,
        courseTasks: [], // Initialize with an empty array
        webglData: {
            buildFolderPath: null,
            loader: null,
            data: null,
            framework: null,
            wasm: null,
        },
        score: score || 100, // Default score to 100 if not provided
    });

    await task.save();

    res.status(201).json({
        message: 'Task created successfully',
        task,
    });
});

// @desc    Upload WebGL files for a task
// @route   POST /api/tasks/:id/upload-webgl
// @access  Private/Admin
exports.uploadWebGLFiles = asyncHandler(async (req, res) => {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const upload = createWebGLStorage(taskId)

    upload.array('webglFiles', 4)(req, res, async (err) => {
        if (err) {
            res.status(400);
            throw new Error('Error uploading WebGL files: ' + err.message);
        }

        try {
            if (!req.files || req.files.length === 0) {
                res.status(400);
                throw new Error('No files uploaded');
            }

            if (task.webglData.buildFolderPath) {
                // Clean up previous files if they exist
                if (fs.existsSync(task.webglData.buildFolderPath)) {
                    fs.rmSync(task.webglData.buildFolderPath, { recursive: true, force: true });
                }
            }

            const buildFolderPath = path.join(__dirname, '../uploads/webgl', taskId);

            const webglData = {
                buildFolderPath,
                loader: null,
                data: null,
                framework: null,
                wasm: null,
            }

            req.files.forEach(file => {
                const filename = file.filename.toLowerCase();
                const filePath = file.path;

                if (filename.includes('loader')) {
                    webglData.loader = filePath;
                } else if (filename.includes('framework')) {
                    webglData.framework = filePath;
                } else if (filename.includes('.data')) {
                    webglData.data = filePath;
                } else if (filename.includes('.wasm')) {
                    webglData.wasm = filePath;
                }
            });

            // Check if required files are present
            if (!webglData.loader || !webglData.data) {
                // Clean up uploaded files
                req.files.forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                });
                return res.status(400).json({
                    success: false,
                    message: 'Loader and Data files are required for WebGL build'
                });
            }

            task.webglData = webglData;
            await task.save();

            res.status(200).json({
                success: true,
                message: 'WebGL files uploaded successfully',
                task: {
                    id: task._id,
                    title: task.title,
                    webglData: task.webglData,
                },
            });

        } catch (error) {
            // Clean up uploaded files in case of error
            if (req.files) {
                req.files.forEach(file => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                });
            }
            throw new Error('Error processing WebGL files: ' + error.message);
        }
    });
});

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private/Teacher
exports.getAllTasks = asyncHandler(async (req, res) => {
    const tasks = await Task.find();

    res.status(200).json({
        message: 'Tasks retrieved successfully',
        count: tasks.length,
        tasks,
    });
});

// @desc    Get a task by ID
// @route   GET /api/tasks/:id
// @access  Private/Teacher
exports.getTaskById = asyncHandler(async (req, res) => {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    res.status(200).json({
        message: 'Task retrieved successfully',
        task,
    });
});

// @desc    Assign a task to a course
// @route   POST /api/tasks/:id/assign
// @access  Private/Teacher
exports.assignTaskToCourse = asyncHandler(async (req, res) => {
    const user = req.user;
    const taskId = req.params.id;
    const { courseId, dueDate } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // check uf user is teacher of the course
    if (
        course.teacher.toString() !== user._id.toString() &&
        user.role !== 'admin'
    ) {
        res.status(403);
        throw new Error(
            'You are not authorized to assign tasks to this course'
        );
    }

    // Check if the task is already assigned to the course
    const isAlreadyAssigned = task.courseTasks.find(
        (task) => task.course.toString() === courseId
    );
    if (isAlreadyAssigned) {
        res.status(400);
        throw new Error('Task is already assigned to this course');
    }

    // Create a new course task entry
    task.courseTasks.push({
        course: courseId,
        dueDate: new Date(dueDate),
    });

    await task.save();

    course.tasks.push(taskId);
    await course.save();

    res.status(200).json({
        message: 'Task assigned to course successfully',
        task,
        course,
    });
});

// @desc    Unassign a task from a course
// @route   POST /api/tasks/:id/unassign
// @access  Private/Teacher
exports.unassignTaskFromCourse = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const { courseId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // check if user is teacher of the course
    if (
        course.teacher.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
    ) {
        res.status(403);
        throw new Error(
            'You are not authorized to unassign tasks from this course'
        );
    }

    // Remove from courseAssignments array
    const taskIndex = task.courseTasks.findIndex(
        (assignment) => assignment.course.toString() === courseId
    );

    if (taskIndex === -1) {
        res.status(400);
        throw new Error('Task is not assigned to this course');
    }

    task.courseTasks.splice(taskIndex, 1);
    await task.save();

    course.tasks.pull(taskId);
    await course.save();

    res.status(200).json({
        success: true,
        message: 'Task unassigned from course successfully',
    });
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
exports.deleteTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    if (task.courseTasks.length > 0) {
        const courseIds = task.courseTasks.map(
            (assignment) => assignment.course
        );
        await Course.updateMany(
            { _id: { $in: courseIds } },
            { $pull: { tasks: taskId } }
        );
    }

    await task.deleteOne();

    res.status(200).json({
        message: 'Task deleted successfully',
        taskId,
    });
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private/Admin
exports.updateTask = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const { title, description, webglUrl, score } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.webglUrl = webglUrl || task.webglUrl;
    task.score = score || task.score;

    await task.save();

    res.status(200).json({
        message: 'Task updated successfully',
        task,
    });
});

// @desc    Update task Assignments
// @route   PUT /api/tasks/:id/assign/:courseId
// @access  Private/Teacher
exports.updateTaskDueDate = asyncHandler(async (req, res) => {
    const user = req.user;
    const { id: taskId, courseId } = req.params;
    const { dueDate } = req.body;

    const task = await Task.findById(taskId);

    if (!task) {
        res.status(404);
        throw new Error('Task is not found');
    }

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if the user is the teacher of the course
    if (
        course.teacher.toString() !== user._id.toString() &&
        user.role !== 'admin'
    ) {
        res.status(403);
        throw new Error(
            'You are not authorized to update assignments for this course'
        );
    }

    // Find the assignment for the course
    const assignmentIndex = task.courseTasks.findIndex(
        (assignment) => assignment.course.toString() === courseId
    );

    if (assignmentIndex === -1) {
        res.status(404);
        throw new Error('Task is not assigned to this course');
    }

    // Update the due date
    task.courseTasks[assignmentIndex].dueDate = new Date(dueDate);
    await task.save();

    res.status(200).json({
        success: true,
        message: 'Task assignment updated successfully',
        assingment: task.courseTasks[assignmentIndex],
    });
});

// @desc    Get all tasks assigned to a course
// @route   GET /api/courses/:courseId/tasks
// @access  Private
exports.getTasksByCourse = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const user = req.user;

    const course = await Course.findById(courseId).populate('tasks');
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    if (
        !course.students.includes(user._id) &&
        course.teacher.toString() !== user._id.toString() &&
        user.role !== 'admin' // Allow admin to view tasks as well
    ) {
        res.status(403);
        throw new Error('You are not authorized to view tasks for this course');
    }

    const tasks = await Task.find({
        'courseTasks.course': courseId,
    }).populate('submissions', 'student submittedAt grade');

    // Map tasks to include course-specific due date
    const tasksWithDueDate = tasks.map((task) => {
        const assignment = task.courseTasks.find(
            (a) => a.course.toString() === courseId
        );
        return {
            ...task.toObject(),
            dueDate: assignment ? assignment.dueDate : null,
            assignedAt: assignment ? assignment.assignedAt : null,
        };
    });

    res.status(200).json({
        success: true,
        count: tasksWithDueDate.length,
        tasks: tasksWithDueDate,
    });
});
