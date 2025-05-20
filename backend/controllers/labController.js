// controllers/labController.js
const Lab = require('../models/Lab');
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

// @desc    Create new lab
// @route   POST /api/labs
// @access  Private/Teacher or Admin
const createLab = asyncHandler(async (req, res) => {
    const { title, startDate, deadline, filePath, teachers = [], students = [] } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(deadline);

    if (start >= end) {
        res.status(400);
        throw new Error('Start date must be before deadline');
    }

    // Create lab
    const lab = await Lab.create({
        title,
        startDate: start,
        deadline: end,
        filePath,
        teachers: teachers.length ? teachers : [req.user._id], // Default to current user if no teachers specified
        students
    });

    if (lab) {
        res.status(201).json(lab);
    } else {
        res.status(400);
        throw new Error('Invalid lab data');
    }
});

// @desc    Get all labs
// @route   GET /api/labs
// @access  Private
const getLabs = asyncHandler(async (req, res) => {
    // If user is admin or teacher, return all labs
    // If user is student, return only labs they are enrolled in
    let query = {};

    if (req.user.role === 'student') {
        query.students = req.user._id;
    } else if (req.user.role === 'teacher') {
        query.$or = [
            { teachers: req.user._id },
            { students: req.user._id }
        ];
    }
    // For admin, no filtering needed - return all labs

    const labs = await Lab.find(query)
        .populate('teachers', 'name email')
        .populate('students', 'name email')
        .sort({ startDate: -1 });

    res.json(labs);
});

// @desc    Get lab by ID
// @route   GET /api/labs/:id
// @access  Private
const getLabById = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('Invalid lab ID');
    }

    const lab = await Lab.findById(req.params.id)
        .populate('teachers', 'name email')
        .populate('students', 'name email');

    if (!lab) {
        res.status(404);
        throw new Error('Lab not found');
    }

    // Check if user has access to this lab
    const isTeacher = lab.teachers.some(teacher =>
        teacher._id.toString() === req.user._id.toString()
    );

    const isStudent = lab.students.some(student =>
        student._id.toString() === req.user._id.toString()
    );

    if (req.user.role !== 'admin' && !isTeacher && !isStudent) {
        res.status(403);
        throw new Error('You do not have access to this lab');
    }

    res.json(lab);
});

// @desc    Update lab
// @route   PUT /api/labs/:id
// @access  Private/Teacher or Admin
const updateLab = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('Invalid lab ID');
    }

    const lab = await Lab.findById(req.params.id);

    if (!lab) {
        res.status(404);
        throw new Error('Lab not found');
    }

    // Check if user is a teacher for this lab or admin
    const isTeacher = lab.teachers.some(teacher =>
        teacher.toString() === req.user._id.toString()
    );

    if (req.user.role !== 'admin' && !isTeacher) {
        res.status(403);
        throw new Error('Only teachers of this lab or admins can update it');
    }

    // Check dates if they're provided
    if (req.body.startDate && req.body.deadline) {
        const start = new Date(req.body.startDate);
        const end = new Date(req.body.deadline);

        if (start >= end) {
            res.status(400);
            throw new Error('Start date must be before deadline');
        }
    } else if (req.body.startDate && !req.body.deadline) {
        const start = new Date(req.body.startDate);
        const end = new Date(lab.deadline);

        if (start >= end) {
            res.status(400);
            throw new Error('Start date must be before existing deadline');
        }
    } else if (!req.body.startDate && req.body.deadline) {
        const start = new Date(lab.startDate);
        const end = new Date(req.body.deadline);

        if (start >= end) {
            res.status(400);
            throw new Error('Existing start date must be before deadline');
        }
    }

    // Update fields
    lab.title = req.body.title || lab.title;
    lab.startDate = req.body.startDate ? new Date(req.body.startDate) : lab.startDate;
    lab.deadline = req.body.deadline ? new Date(req.body.deadline) : lab.deadline;
    lab.filePath = req.body.filePath || lab.filePath;

    // Update arrays only if they're provided
    if (req.body.teachers) lab.teachers = req.body.teachers;
    if (req.body.students) lab.students = req.body.students;

    const updatedLab = await lab.save();

    res.json(updatedLab);
});

// @desc    Delete lab
// @route   DELETE /api/labs/:id
// @access  Private/Admin
const deleteLab = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('Invalid lab ID');
    }

    const lab = await Lab.findById(req.params.id);

    if (!lab) {
        res.status(404);
        throw new Error('Lab not found');
    }

    await lab.remove();
    res.json({ message: 'Lab removed successfully' });
});

// @desc    Add student to lab
// @route   PUT /api/labs/:id/students
// @access  Private/Teacher or Admin
const addStudent = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('Invalid lab ID');
    }

    const { studentId } = req.body;

    if (!studentId || !mongoose.Types.ObjectId.isValid(studentId)) {
        res.status(400);
        throw new Error('Valid student ID is required');
    }

    const lab = await Lab.findById(req.params.id);

    if (!lab) {
        res.status(404);
        throw new Error('Lab not found');
    }

    // Check if user is a teacher for this lab or admin
    const isTeacher = lab.teachers.some(teacher =>
        teacher.toString() === req.user._id.toString()
    );

    if (req.user.role !== 'admin' && !isTeacher) {
        res.status(403);
        throw new Error('Only teachers of this lab or admins can add students');
    }

    // Check if student is already added
    if (lab.students.includes(studentId)) {
        res.status(400);
        throw new Error('Student is already added to this lab');
    }

    lab.students.push(studentId);
    await lab.save();

    res.json(lab);
});

// @desc    Remove student from lab
// @route   DELETE /api/labs/:id/students/:studentId
// @access  Private/Teacher or Admin
const removeStudent = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id) ||
        !mongoose.Types.ObjectId.isValid(req.params.studentId)) {
        res.status(400);
        throw new Error('Invalid IDs provided');
    }

    const lab = await Lab.findById(req.params.id);

    if (!lab) {
        res.status(404);
        throw new Error('Lab not found');
    }

    // Check if user is a teacher for this lab or admin
    const isTeacher = lab.teachers.some(teacher =>
        teacher.toString() === req.user._id.toString()
    );

    if (req.user.role !== 'admin' && !isTeacher) {
        res.status(403);
        throw new Error('Only teachers of this lab or admins can remove students');
    }

    // Check if student is in the lab
    if (!lab.students.includes(req.params.studentId)) {
        res.status(400);
        throw new Error('Student is not enrolled in this lab');
    }

    lab.students = lab.students.filter(
        student => student.toString() !== req.params.studentId
    );

    await lab.save();

    res.json(lab);
});

// @desc    Add teacher to lab
// @route   PUT /api/labs/:id/teachers
// @access  Private/Admin
const addTeacher = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400);
        throw new Error('Invalid lab ID');
    }

    const { teacherId } = req.body;

    if (!teacherId || !mongoose.Types.ObjectId.isValid(teacherId)) {
        res.status(400);
        throw new Error('Valid teacher ID is required');
    }

    const lab = await Lab.findById(req.params.id);

    if (!lab) {
        res.status(404);
        throw new Error('Lab not found');
    }

    // Check if teacher is already added
    if (lab.teachers.includes(teacherId)) {
        res.status(400);
        throw new Error('Teacher is already added to this lab');
    }

    lab.teachers.push(teacherId);
    await lab.save();

    res.json(lab);
});

// @desc    Remove teacher from lab
// @route   DELETE /api/labs/:id/teachers/:teacherId
// @access  Private/Admin
const removeTeacher = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id) ||
        !mongoose.Types.ObjectId.isValid(req.params.teacherId)) {
        res.status(400);
        throw new Error('Invalid IDs provided');
    }

    const lab = await Lab.findById(req.params.id);

    if (!lab) {
        res.status(404);
        throw new Error('Lab not found');
    }

    // Check if teacher is in the lab
    if (!lab.teachers.includes(req.params.teacherId)) {
        res.status(400);
        throw new Error('Teacher is not assigned to this lab');
    }

    // Don't remove if it's the last teacher
    if (lab.teachers.length <= 1) {
        res.status(400);
        throw new Error('Cannot remove the last teacher from a lab');
    }

    lab.teachers = lab.teachers.filter(
        teacher => teacher.toString() !== req.params.teacherId
    );

    await lab.save();

    res.json(lab);
});

module.exports = {
    createLab,
    getLabs,
    getLabById,
    updateLab,
    deleteLab,
    addStudent,
    removeStudent,
    addTeacher,
    removeTeacher
};