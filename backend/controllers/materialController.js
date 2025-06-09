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
    if (course.teacher.toString() !== user._id.toString() && user.role !== 'admin') {
        res.status(403);
        throw new Error(
            'You are not authorized to add materials to this course'
        );
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

// @desc    Get all materials in a folder
// @route   GET /api/courses/:courseId/folders/:folderId/materials
// @access  Private/Student and Teacher
exports.getMaterials = asyncHandler(async (req, res) => {
    const user = req.user;
    const { courseId, folderId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if the user is enrolled in the course or is a teacher
    if (
        !course.students.includes(user._id) &&
        course.teacher.toString() !== user._id.toString() &&
        user.role !== 'admin' // Allow admin to view materials as well
    ) {
        res.status(403);
        throw new Error(
            'You are not authorized to view materials in this course'
        );
    }

    const folder = await Folder.findById(folderId).populate('materials');
    if (!folder) {
        res.status(404);
        throw new Error('Folder not found');
    }

    res.status(200).json({
        success: true,
        materials: folder.materials,
    });
});

// @desc    Get a single material by ID
// @route   GET /api/courses/:courseId/folders/:folderId/materials/:materialId
// @access  Private/Student and Teacher
exports.getMaterialById = asyncHandler(async (req, res) => {
    const user = req.user;
    const { courseId, folderId, materialId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if the user is enrolled in the course or is a teacher
    if (
        !course.students.includes(user._id) &&
        course.teacher.toString() !== user._id.toString() &&
        user.role !== 'admin' // Allow admin to view materials as well
    ) {
        res.status(403);
        throw new Error(
            'You are not authorized to view this material in this course'
        );
    }

    const folder = await Folder.findById(folderId);
    if (!folder) {
        res.status(404);
        throw new Error('Folder not found');
    }

    const material = await Material.findById(materialId);
    if (!material) {
        res.status(404);
        throw new Error('Material not found');
    }

    res.status(200).json({
        success: true,
        material,
    });
});

// @desc    Download a material file
// @route   GET /api/courses/:courseId/folders/:folderId/materials/:materialId/download
// @access  Private/Student and Teacher
exports.downloadMaterial = asyncHandler(async (req, res) => {
    const user = req.user;
    const { courseId, folderId, materialId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if the user is enrolled in the course or is a teacher
    if (
        !course.students.includes(user._id) &&
        course.teacher.toString() !== user._id.toString() &&
        user.role !== 'admin' // Allow admin to download materials as well
    ) {
        res.status(403);
        throw new Error(
            'You are not authorized to download this material in this course'
        );
    }

    const folder = await Folder.findById(folderId);
    if (!folder) {
        res.status(404);
        throw new Error('Folder not found');
    }

    const material = await Material.findById(materialId);
    if (!material) {
        res.status(404);
        throw new Error('Material not found');
    }

    res.download(material.filePath, material.title + path.extname(material.filePath));
});


// @desc    Delete a material
// @route   DELETE /api/courses/:courseId/folders/:folderId/materials/:materialId
// @access  Private/Teacher
exports.deleteMaterial = asyncHandler(async (req, res) => {
    const user = req.user;
    const { courseId, folderId, materialId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
        res.status(404);
        throw new Error('Course not found');
    }

    // Check if the user is a teacher of this course
    if (course.teacher.toString() !== user._id.toString() && user.role !== 'admin') {
        res.status(403);
        throw new Error(
            'You are not authorized to delete materials in this course'
        );
    }

    const folder = await Folder.findById(folderId);
    if (!folder) {
        res.status(404);
        throw new Error('Folder not found');
    }

    const material = await Material.findById(materialId);
    if (!material) {
        res.status(404);
        throw new Error('Material not found');
    }

    // Remove the material from the folder
    folder.materials.pull(material._id);
    await folder.save();

    // Delete the material file from the server
    if (fs.existsSync(material.filePath)) {
        fs.unlinkSync(material.filePath);
    }

    await material.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Material deleted successfully',
    });
});
