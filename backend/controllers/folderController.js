const Folder = require('../models/Folder');
const Course = require('../models/Course');
const Material = require('../models/Material');
const fs = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');

// @desc    Create a new folder
// @route   POST /api/courses/:courseId/folders
// @access  Private/Teacher
const createFolder = asyncHandler(async (req, res) => {
    const user = req.user;
    const { title } = req.body;
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if the user is a teacher of this course or an admin
    if (
        course.teacher.toString() !== user._id.toString() &&
        user.role !== 'admin'
    ) {
        res.status(403);
        throw new Error(
            'You are not authorized to create folders in this course'
        );
    }

    const folder = new Folder({ title });
    await folder.save();

    course.folders.push(folder._id);
    await course.save();

    res.status(201).json({
        success: true,
        message: 'Folder created successfully',
        folder,
    });
});

// @desc    Get all folders for a course
// @route   GET /api/courses/:courseId/folders
// @access  Private/Teacher or Student
const getFolders = asyncHandler(async (req, res) => {
    const user = req.user;
    const { courseId } = req.params;

    const course = await Course.findById(courseId).populate('folders');
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if the user is a student or teacher of this course
    if (
        !course.students.includes(user._id) &&
        course.teacher.toString() !== user._id.toString() &&
        user.role !== 'admin' // Allow admin to view folders as well
    ) {
        res.status(403);
        throw new Error(
            'You are not authorized to view folders in this course'
        );
    }

    res.status(200).json({
        success: true,
        folders: course.folders,
    });
});

// @desc    Get a single folder by ID
// @route   GET /api/courses/:courseId/folders/:folderId
// @access  Private/Teacher or Student
const getFolderById = asyncHandler(async (req, res) => {
    const user = req.user;
    const { courseId, folderId } = req.params;

    const course = await Course.findById(courseId).populate('folders');
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if the user is a student or teacher of this course
    if (
        !course.students.includes(user._id) &&
        course.teacher.toString() !== user._id.toString() &&
        user.role !== 'admin' // Allow admin to view folders as well
    ) {
        res.status(403);
        throw new Error('You are not authorized to view this folder');
    }

    const folder = await Folder.findById(folderId);

    if (!folder) {
        res.status(404);
        throw new Error('Folder not found');
    }

    res.status(200).json({
        success: true,
        folder,
    });
});

// @desc    Update a folder
// @route   PUT /api/courses/:courseId/folders/:folderId
// @access  Private/Teacher
const updateFolder = asyncHandler(async (req, res) => {
    const user = req.user;
    const { courseId, folderId } = req.params;
    const { title } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if the user is a teacher of this course
    if (
        course.teacher.toString() !== user._id.toString() &&
        user.role !== 'admin'
    ) {
        res.status(403);
        throw new Error('You are not authorized to update this folder');
    }

    const folder = await Folder.findById(folderId);
    if (!folder) {
        res.status(404);
        throw new Error('Folder not found');
    }

    folder.title = title || folder.title;
    await folder.save();

    res.status(200).json({
        success: true,
        message: 'Folder updated successfully',
        folder,
    });
});

// @desc    Delete a folder
// @route   DELETE /api/courses/:courseId/folders/:folderId
// @access  Private/Teacher
const deleteFolder = asyncHandler(async (req, res) => {
    const user = req.user;
    const { courseId, folderId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if the user is a teacher of this course
    if (course.teacher.toString() !== user._id.toString() && user.role !== 'admin') {
        res.status(403);
        throw new Error('You are not authorized to delete this folder');
    }

    const folder = await Folder.findById(folderId);
    if (!folder) {
        res.status(404);
        throw new Error('Folder not found');
    }

    if (folder.materials && folder.materials.length > 0) {
        const materials = await Material.find({
            _id: { $in: folder.materials },
        });
        for (const material of materials) {
            if (material.filePath && fs.existsSync(material.filePath)) {
                fs.unlinkSync(material.filePath);
            }
            await material.deleteOne();
        }
    }

    // Remove the folder from the database
    await folder.deleteOne();

    // Remove the folder from the course
    course.folders.pull(folder._id);
    await course.save();

    res.status(200).json({
        success: true,
        message: 'Folder deleted successfully',
    });
});

// Exporting the functions for use in routes
module.exports = {
    createFolder,
    getFolders,
    getFolderById,
    updateFolder,
    deleteFolder,
};
