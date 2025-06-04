const Material = require('../models/Material');
const Folder = require('../models/Folder');
const Course = require('../models/Course');
const asyncHandler = require('express-async-handler');
const path = require('path');
const fs = require('fs');

// @desc    Create a new material
// @route   POST /api/courses/:courseId/folders/:folderId/materials
// @access  Private/Teacher
exports.addMaterial = asyncHandler(async (req, res) => {
    const user = req.user;
    const { courseId, folderId } = req.params;
    const { title, description } = req.body;
    const file = req.file;

    if (!file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if the user is a teacher of this course
    if (course.teacher.toString() !== user._id.toString()) {
        res.status(403);
        throw new Error('You are not authorized to add materials to this course');
    }

    const folder = await Folder.findById(folderId);
    if (!folder) {
        res.status(404);
        throw new Error('Folder not found');
    }

    const material = new Material({
        title,
        description,
        filePath: file.path,
    });

    await material.save();

    folder.materials.push(material._id);
    await folder.save();

    res.status(201).json({
        success: true,
        message: 'Material uploaded successfully',
        material,
    });
});