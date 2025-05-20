// routes/labRoutes.js
const express = require('express');
const router = express.Router();
const {
    createLab,
    getLabs,
    getLabById,
    updateLab,
    deleteLab,
    addStudent,
    removeStudent,
    addTeacher,
    removeTeacher
} = require('../controllers/labController');

// Fix these paths - change middleware to middlewares
const { authenticate, authorize } = require('../middleware/authMiddleware');
const { labValidation, paramValidation } = require('../middleware/validationMiddleware');

// List and create labs
router.route('/')
    .get(authenticate, getLabs)
    .post(
        authenticate,
        authorize(['teacher', 'admin']),
        labValidation.create,
        createLab
    );

// Single lab operations
router.route('/:id')
    .get(
        authenticate,
        paramValidation.resourceId,
        getLabById
    )
    .put(
        authenticate,
        authorize(['teacher', 'admin']),
        paramValidation.resourceId,
        labValidation.update,
        updateLab
    )
    .delete(
        authenticate,
        authorize('admin'),
        paramValidation.resourceId,
        deleteLab
    );

// Student enrollment management (lab-student relationship)
router.route('/:id/students')
    .post(
        authenticate,
        authorize(['teacher', 'admin']),
        paramValidation.resourceId,
        labValidation.addStudent,
        addStudent
    );

router.route('/:id/students/:studentId')
    .delete(
        authenticate,
        authorize(['teacher', 'admin']),
        paramValidation.resourceId,
        paramValidation.studentId,
        removeStudent
    );

// Teacher assignment management (lab-teacher relationship)
router.route('/:id/teachers')
    .post(
        authenticate,
        authorize('admin'),
        paramValidation.resourceId,
        labValidation.addTeacher,
        addTeacher
    );

router.route('/:id/teachers/:teacherId')
    .delete(
        authenticate,
        authorize('admin'),
        paramValidation.resourceId,
        paramValidation.teacherId,
        removeTeacher
    );

module.exports = router;