const mongoose = require('mongoose');
const asyncHandler = require('express-async-handler');

const User = require('../models/User');
const Course = require('../models/Course');

// @desc    Get all courses
// @route   PUT /api/courses
// @access  Public
const getAllCourses = asyncHandler(async (req, res) => {
    let courses = [];
    // Check if the user is authenticated and has a role
    if (!req.user) {
        // If no user is authenticated, return public courses
        res.status(401);
        throw new Error('Not authorized, no user found');
    }
    // Admin can get all courses, teachers, students, tasks, and folders
    if (['admin'].includes(req.user.role)) {
        courses = await Course.find()
            .populate('teacher', 'firstName lastName email')
            .populate('students', 'firstName lastName email')
            .populate('tasks', 'title description dueDate');
        //.populate('folders', 'name');
    } else {
        // Public access to get all courses
        courses = await Course.find()
            .populate('teacher', 'firstName lastName email')
            .populate('tasks', 'title description dueDate');
        //.populate('folders', 'name');
    }
    if (!courses || courses.length === 0) {
        res.status(404);
        throw new Error('No courses found');
    }
    res.json(courses);
});

// @desc    Get course by ID
// @route   GET /api/courses/:id
// @access  Public
const getCourseById = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id)
        .populate('teacher', 'firstName lastName email')
        .populate('students', 'firstName lastName email')
        .populate('tasks', 'title description dueDate');
    //.populate('folders', 'name');

    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }
    res.json(course);
});

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Teacher
const createCourse = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const course = new Course({
        name,
        description,
        teacher: req.user._id, // Assuming the user creating the course is the teacher
    });

    const created = await course.save();
    if (!created) {
        res.status(400);
        throw new Error('Course creation failed');
    }
    res.status(201).json(created);
});

// @desc    Update a course
// @route   PUT /api/courses/:id
// @access  Private/Teacher
const updateCourse = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    if (
        course.teacher.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
    ) {
        res.status(403);
        throw new Error('Not authorized to update this course');
    }

    course.name = name || course.name;
    course.description = description || course.description;

    const updated = await course.save();
    res.json(updated);
});

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Teacher
const deleteCourse = asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    if (
        course.teacher.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
    ) {
        res.status(403);
        throw new Error('Not authorized to update this course');
    }

    await Course.deleteCourseAndAssociatedData(req.params.id);

    res.json({ message: 'Course removed' });
});

// @desc    Enroll user in a Course
// @route   PUT /api/courses/enroll
// @access  Private
const enrollInCourse = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.role !== 'student') {
        // If the user is not a student, they cannot enroll in courses
        res.status(400);
        throw new Error('Only students can enroll in courses');
    }

    const courseCode = req.body.code;
    if (!courseCode) {
        res.status(400);
        throw new Error('Course code is required');
    }

    const course = await Course.findOne({ code: courseCode });

    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    if (course.students.includes(user._id)) {
        res.status(400);
        throw new Error('User already enrolled in this course');
    }

    user.courses.push(course._id);
    course.students.push(user._id);

    await user.save();
    await course.save();

    res.status(200).json({
        message: 'User enrolled in course successfully',
    });
});

// @desc    Unenroll user from a Course
// @route   PUT /api/courses/unenroll
// @access  Private
const unenrollFromCourse = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.role !== 'student') {
        res.status(400);
        throw new Error('Only students can unenroll from courses');
    }

    const courseCode = req.body.code;
    if (!courseCode) {
        res.status(400);
        throw new Error('Course code is required');
    }

    const course = await Course.findOne({code: courseCode});
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    if (!user.courses.includes(course._id)) {
        res.status(400);
        throw new Error('User not enrolled in this course');
    }

    user.courses.pull(course._id);
    course.students.pull(user._id);

    await user.save();
    await course.save();

    res.status(200).json({
        message: 'User unenrolled from course successfully',
    });
});

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    unenrollFromCourse,
};
