const Task = require('../models/Task');
const Course = require('../models/Course');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const createWebGLStorage = require('../config/webglMulter');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const zipUpload = require('../config/zipMulter');

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

    // Clean up previous files if they exist
    if (
        task.webglData.buildFolderPath &&
        fs.existsSync(task.webglData.buildFolderPath)
    ) {
        fs.rmSync(task.webglData.buildFolderPath, {
            recursive: true,
            force: true,
        });
    }

    const upload = createWebGLStorage(taskId);

    upload.array('webglFiles', 4)(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            res.status(400);
            throw new Error('Error uploading WebGL files: ' + err.message);
        }

        try {
            if (!req.files || req.files.length === 0) {
                console.error('No files in request');
                res.status(400);
                throw new Error(
                    'No files uploaded. Please select WebGL build files.'
                );
            }

            // Determine base directory based on environment
            const isDocker =
                process.env.NODE_ENV === 'production' ||
                fs.existsSync('/.dockerenv');
            const baseDir = isDocker
                ? `/usr/src/app/frontend/public/webgl-tasks`
                : path.join(__dirname, '../../frontend/public/webgl-tasks');

            const buildFolderPath = path.join(baseDir, taskId);

            const webglData = {
                buildFolderPath,
                loader: null,
                data: null,
                framework: null,
                wasm: null,
            };

            // Process uploaded files
            req.files.forEach((file) => {
                const filename = file.filename.toLowerCase();
                const filePath = file.path;

                // Store relative paths for frontend access
                const relativePath = `/webgl-tasks/${taskId}/${file.filename}`;

                if (filename.includes('loader')) {
                    webglData.loader = relativePath;
                } else if (filename.includes('framework')) {
                    webglData.framework = relativePath;
                } else if (
                    filename.includes('.data') ||
                    filename.includes('data')
                ) {
                    webglData.data = relativePath;
                } else if (
                    filename.includes('.wasm') ||
                    filename.includes('wasm')
                ) {
                    webglData.wasm = relativePath;
                }
            });

            // Validate required files
            if (!webglData.loader || !webglData.data) {
                console.error('Missing required files:', webglData);
                // Clean up uploaded files
                req.files.forEach((file) => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                });
                return res.status(400).json({
                    success: false,
                    message:
                        'Loader and Data files are required for WebGL build',
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
                filesUploaded: req.files.map((file) => ({
                    originalName: file.originalname,
                    savedAs: file.filename,
                    size: file.size,
                })),
            });
        } catch (error) {
            console.error('Error processing WebGL files:', error);
            // Clean up uploaded files in case of error
            if (req.files) {
                req.files.forEach((file) => {
                    if (fs.existsSync(file.path)) {
                        fs.unlinkSync(file.path);
                    }
                });
            }
            throw new Error('Error processing WebGL files: ' + error.message);
        }
    });
});

// @desc    Upload single WebGL file for a task
// @route   POST /api/tasks/:id/upload-webgl/:fileType
// @access  Private/Admin
exports.uploadSingleWebGLFile = asyncHandler(async (req, res) => {
    const taskId = req.params.id;
    const fileType = req.params.fileType; // 'loader', 'data', 'framework', or 'wasm'
    const validFileTypes = ['loader', 'data', 'framework', 'wasm'];
    if (!validFileTypes.includes(fileType)) {
        res.status(400);
        throw new Error(
            'Invalid file type. Must be one of: ' + validFileTypes.join(', ')
        );
    }

    const task = await Task.findById(taskId);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    // Determine base directory based on environment
    const isDocker =
        process.env.NODE_ENV === 'production' || fs.existsSync('/.dockerenv');
    const baseDir = isDocker
        ? `/usr/src/app/frontend/public/webgl-tasks`
        : path.join(__dirname, '../../frontend/public/webgl-tasks');

    const buildFolderPath = path.join(baseDir, taskId);

    // Ensure the build folder exists
    if (!fs.existsSync(buildFolderPath)) {
        fs.mkdirSync(buildFolderPath, { recursive: true });
    }

    // The bug is here: we need to delete the old file OUTSIDE of the upload middleware
    // so that multer has access to the correct file structure after deletion
    if (task.webglData[fileType]) {
        try {
            const oldFilePath = path.join(
                baseDir,
                task.webglData[fileType].replace('/webgl-tasks/', '')
            );

            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
                console.log(`Deleted old ${fileType} file: ${oldFilePath}`);
            }
        } catch (error) {
            console.error(`Error deleting old ${fileType} file:`, error);
            // Continue with upload even if delete fails
        }
    }

    // Set up multer upload AFTER deleting the old file
    const upload = createWebGLStorage(taskId);

    upload.single('webglFile')(req, res, async (err) => {
        if (err) {
            console.error('Multer error:', err);
            res.status(400);
            throw new Error('Error uploading WebGL file: ' + err.message);
        }

        try {
            if (!req.file) {
                console.error('No file in request');
                res.status(400);
                throw new Error(
                    'No file uploaded. Please select a WebGL file.'
                );
            }

            const relativePath = `/webgl-tasks/${taskId}/${req.file.filename}`;

            // Update webglData based on file type
            task.webglData[fileType] = relativePath;

            // If this is the first file, initialize the buildFolderPath
            if (!task.webglData.buildFolderPath) {
                task.webglData.buildFolderPath = buildFolderPath;
            }

            await task.save();

            res.status(200).json({
                success: true,
                message: `${
                    fileType.charAt(0).toUpperCase() + fileType.slice(1)
                } file uploaded successfully`,
                task: {
                    id: task._id,
                    title: task.title,
                    webglData: task.webglData,
                },
                fileUploaded: {
                    originalName: req.file.originalname,
                    savedAs: req.file.filename,
                    size: req.file.size,
                },
            });
        } catch (error) {
            console.error(`Error processing ${fileType} file:`, error);
            // Clean up uploaded file in case of error
            if (req.file && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }
            throw new Error(
                `Error processing ${fileType} file: ${error.message}`
            );
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

    const taskName = task.title.toLowerCase().replace(/\s+/g, '-');

    // Delete WebGL files if they exist
    if (task.webglData && task.webglData.buildFolderPath) {
        try {
            // Determine base directory based on environment
            const extractPath = path.join(__dirname, '../uploads/webgl', taskName);

            if (fs.existsSync(extractPath)) {
                console.log(
                    `Deleting WebGL files for task ${taskId} from path: ${extractPath}`
                );
                fs.rmSync(extractPath, { recursive: true, force: true });
                console.log(
                    `Successfully deleted WebGL files for task ${taskId}`
                );
            } else {
                console.log(
                    `WebGL folder not found for task ${taskId} at path: ${extractPath}`
                );
            }
        } catch (error) {
            console.error(
                `Error deleting WebGL files for task ${taskId}:`,
                error
            );
            // Continue with task deletion even if file deletion fails
        }
    }

    // Remove task from all courses
    if (task.courseTasks.length > 0) {
        const courseIds = task.courseTasks.map(
            (assignment) => assignment.course
        );
        await Course.updateMany(
            { _id: { $in: courseIds } },
            { $pull: { tasks: taskId } }
        );
        console.log(`Removed task ${taskId} from ${courseIds.length} courses`);
    }

    // Delete the task itself
    await task.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Task and associated files deleted successfully',
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

// @desc    Get webgl info for a task
// @route   GET /api/tasks/:id/webgl-info
// @access  Private
exports.getWebGLInfo = asyncHandler(async (req, res) => {
    const { id: taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    if (!task.webglData.loader || !task.webglData.data) {
        res.status(404);
        throw new Error('No WebGL build found for this task');
    }

    res.status(200).json({
        success: true,
        webglData: {
            hasFiles: true,
            buildFolderPath: task.webglData.buildFolderPath,
            files: {
                loader: task.webglData.loader
                    ? path.basename(task.webglData.loader)
                    : null,
                data: task.webglData.data
                    ? path.basename(task.webglData.data)
                    : null,
                framework: task.webglData.framework
                    ? path.basename(task.webglData.framework)
                    : null,
                wasm: task.webglData.wasm
                    ? path.basename(task.webglData.wasm)
                    : null,
            },
        },
    });
});

// @desc    Get WebGL files for a task
// @route   GET /api/tasks/:id/webgl-files/:fileType
// @access  Private
exports.getWebGLFiles = asyncHandler(async (req, res) => {
    const { id: taskId, fileType } = req.params;
    const task = await Task.findById(taskId);
    if (!filePath) {
        res.status(404);
        throw new Error(`No ${fileType} file found for this task`);
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
});

// @desc    Upload a zip file containing WebGL build files
// @route   POST /api/tasks/:id/upload-zip
// @access  Private/Admin
exports.uploadZipFile = asyncHandler(async (req, res) => {
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const zipPath = req.file.path;
    const taskName = task.title.toLowerCase().replace(/\s+/g, '-');
    const extractPath = path.join(__dirname, '../uploads/webgl', taskName);

    // remove old build folder if it exists
    if (task.webglData.buildFolderPath && fs.existsSync(task.webglData.buildFolderPath)) {
        fs.rmSync(task.webglData.buildFolderPath, { recursive: true, force: true });
        console.log(`Deleted old build folder: ${task.webglData.buildFolderPath}`);
    }

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractPath, true);
    console.log(`Extracted zip to: ${extractPath}`);

    task.webglData.buildFolderPath = extractPath;
    task.webglData.indexHtml = extractPath + '/index.html';
    task.webglData.loader = extractPath + `/Build/${taskName}.loader.js`;
    task.webglData.data = extractPath + `/Build/${taskName}.data`;
    task.webglData.framework = extractPath + `/Framework/${taskName}.framework.js`;
    task.webglData.wasm = extractPath + `/Build/${taskName}.wasm`;

    // Clean up the zip file after extraction
    fs.unlinkSync(zipPath);
    console.log(`Deleted zip file: ${zipPath}`);

    await task.save();
    res.status(200).json({
        success: true,
        message: 'Zip file uploaded and extracted successfully',
        task: {
            id: task._id,
            title: task.title,
            webglData: task.webglData,
        },
    });
});