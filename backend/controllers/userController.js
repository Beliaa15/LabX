const User = require('../models/User');
const asyncHandler = require('express-async-handler');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({})
        .select('-password')
        .populate('enrolledLabs', 'name description')
        .populate('teachingLabs', 'name description');
    res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id)
        .select('-password')
        .populate('enrolledLabs', 'name description')
        .populate('teachingLabs', 'name description');

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
    const user = await User.findById(req.params.id);

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
    user.name = req.body.name || user.name;
    user.year = req.body.year || user.year;
    user.role = req.body.role || user.role;

    // Only update password if it's provided
    if (req.body.password) {
        user.password = req.body.password; // Should be hashed in production
    }

    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        year: updatedUser.year,
        role: updatedUser.role,
        enrolledLabs: updatedUser.enrolledLabs,
        teachingLabs: updatedUser.teachingLabs
    });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await user.remove();
        res.json({ message: 'User removed' });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Enroll user in a lab
// @route   PUT /api/users/:id/enroll
// @access  Private
const enrollInLab = asyncHandler(async (req, res) => {
    const { labId } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Check if already enrolled
    if (user.enrolledLabs.includes(labId)) {
        res.status(400);
        throw new Error('User already enrolled in this lab');
    }

    user.enrolledLabs.push(labId);
    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        enrolledLabs: updatedUser.enrolledLabs
    });
});

// @desc    Add teaching lab to user
// @route   PUT /api/users/:id/teaching
// @access  Private/Teacher
const addTeachingLab = asyncHandler(async (req, res) => {
    const { labId } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.role !== 'teacher') {
        res.status(403);
        throw new Error('Only teachers can teach labs');
    }

    // Check if already teaching
    if (user.teachingLabs.includes(labId)) {
        res.status(400);
        throw new Error('User already teaching this lab');
    }

    user.teachingLabs.push(labId);
    const updatedUser = await user.save();

    res.json({
        _id: updatedUser._id,
        teachingLabs: updatedUser.teachingLabs
    });
});

module.exports = {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    enrollInLab,
    addTeachingLab
};