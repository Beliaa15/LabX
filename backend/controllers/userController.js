const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const User = require('../models/User');
const Course = require('../models/Course');
const asyncHandler = require('express-async-handler');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin
const getStudents = asyncHandler(async (req, res) => {
    const users = await User.find({ role: 'student' })
        .select('-password')
        .populate('courses', 'name description');
    res.json(users);
});

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Private/Admin
const getTeachers = asyncHandler(async (req, res) => {
    const users = await User.find({ role: 'teacher' })
        .select('-password')
        .populate('courses', 'name description');

    res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
    // If the user is requesting their own data, use 'me' as the ID
    const userId = req.params.id || req.user._id;
    // Find user by ID and populate courses
    const user = await User.findById(userId)
        .select('-password')
        .populate('courses', 'name description');

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
    const userId = req.params.id || req.user._id;
    const user = await User.findById(userId);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if email is being updated and if it already exists
    if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
            res.status(400);
            throw new Error('Email already in use');
        }
    }

    // Update user fields
    user.email = req.body.email || user.email;
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;

    // Only update password if it's provided
    if (req.body.password) {
        const password = req.body.password;
        const hashedPassword = await bcrypt.hash(password, 12);
        user.password = hashedPassword; // Should be hashed in production
    }

    const updatedUser = await user.save();

    res.status(202).json({ message: 'User updated successfully' });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Delete user and associated data
    await User.deleteUserAndAssociatedData(req.params.id);

    res.status(204);
});

module.exports = {
    getStudents,
    getTeachers,
    getUserById,
    updateUser,
    deleteUser,
};
