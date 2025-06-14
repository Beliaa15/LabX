const StudentSubmission = require('../models/StudentSubmission');
const Task = require('../models/Task');
const Course = require('../models/Course');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Create a new student submission
// @route   POST /api/courses/:courseId/tasks/:taskId/submit
// @access  Private/Student
exports.submitTask = asyncHandler(async (req, res) => {
    const user = req.user; // Assuming user is set in middleware
    const { courseId, taskId } = req.params;

    const { grade } = req.body;

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if the task exists
    const task = await Task.findById(taskId);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const courseTask = task.courseTasks.find(
        (ct) => ct.course.toString() === courseId
    );
    if (!courseTask) {
        res.status(404);
        throw new Error('Task is not assigned to this course');
    }

    // Check if the user is enrolled in the course
    if (!course.students.includes(user._id)) {
        res.status(403);
        throw new Error('You are not enrolled in this course');
    }

    const existingSubmission = await StudentSubmission.findOne({
        student: user._id,
        task: taskId,
    });

    if (existingSubmission) {
        res.status(400);
        throw new Error('You have already submitted this task');
    }

    const isLate = new Date() > courseTask.dueDate;
    const status = isLate ? 'late' : 'submitted';


    const submission = await StudentSubmission.create({
        student: user._id,
        task: taskId,
        grade: grade || null,
        status: status,
        submittedAt: new Date(),
    });

    // Update the task's submissions array
    task.submissions.push(submission._id);

    await task.save();

    res.status(201).json(submission);
});

// @desc    Update a student submission
// @route   PUT /api/courses/:courseId/tasks/:taskId/submit
// @access  Private/Student
exports.updateSubmission = asyncHandler(async (req, res) => {
    const user = req.user; // Assuming user is set in middleware
    const { courseId, taskId } = req.params;

    const { grade } = req.body;

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if the task exists
    const task = await Task.findById(taskId);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const courseTask = task.courseTasks.find(
        (ct) => ct.course.toString() === courseId
    );
    if (!courseTask) {
        res.status(404);
        throw new Error('Task is not assigned to this course');
    }

    // Check if the user is enrolled in the course
    if (!course.students.includes(user._id)) {
        res.status(403);
        throw new Error('You are not enrolled in this course');
    }

    const isLate = new Date() > courseTask.dueDate;
    const status = isLate ? 'late' : 'submitted';

    const submission = await StudentSubmission.findOneAndUpdate(
        { student: user._id, task: taskId },
        { grade: grade || null, status: status, submittedAt: new Date() },
        { new: true }
    );

    if (!submission) {
        res.status(404);
        throw new Error('Submission not found');
    }

    res.status(200).json(submission);
});

// @desc    Get all submissions for a task
// @route   GET /api/courses/:courseId/tasks/:taskId/submissions
// @access  Private/Teacher
exports.getTaskSubmissions = asyncHandler(async (req, res) => {
    const user = req.user; // Assuming user is set in middleware
    const { courseId, taskId } = req.params;

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if the user is a teacher of the course
    if (course.teacher.toString() !== user._id.toString() && !user.role !== 'admin') {
        res.status(403);
        throw new Error('You are not authorized to view submissions for this course');
    }

    // Check if the task exists
    const task = await Task.findById(taskId);
    if (!task) {
        res.status(404);
        throw new Error('Task not found');
    }

    const submissions = await StudentSubmission.find({ task: taskId })
        .populate('student', 'firstName lastName email')
        .populate('task', 'title description score')
        .sort({ submittedAt: -1 });

    const enrolledStudents = await User.find({
        _id: { $in: course.students },
    }).select('firstName lastName email');

    const submittedStudentIds = submissions.map(sub => sub.student._id.toString());
    const notSubmitted = enrolledStudents.filter(
        student => !submittedStudentIds.includes(student._id.toString())
    );

    res.status(200).json({
        success: true,
        submissionsCount: submissions.length,
        totalStudents: enrolledStudents.length,
        submissions,
        notSubmitted,
    });
});