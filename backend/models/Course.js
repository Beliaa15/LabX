const { Schema, model, models } = require('mongoose');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const Task = require('./Task');
const StudentSubmission = require('./StudentSubmission');
const Folder = require('./Folder');
const Material = require('./Material');

const courseSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        teacher: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        code: {
            type: String,
            required: true,
            unique: true,
        },
        students: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        tasks: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Task',
            },
        ],
        folders: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Folder',
            },
        ],
    },
    { timestamps: true }
);

// Middleware to generate a unique course code before saving
courseSchema.pre('validate', async function (next) {
    if (!this.code) {
        let unique = false;
        while (!unique) {
            const generatedCode = crypto.randomBytes(3).toString('hex'); // 6-char hex code
            const existing = await models.Course.findOne({
                code: generatedCode,
            });
            if (!existing) {
                this.code = generatedCode;
                unique = true;
            }
        }
    }
    next();
});

courseSchema.statics.deleteCourseAndAssociatedData = async function (courseId) {
    const course = await this.findById(courseId);
    if (!course) {
        throw new Error('Course not found');
    }

    // Remove course from students' course lists
    await this.updateMany(
        { students: courseId },
        { $pull: { students: courseId } }
    );

    // Remove course from teacher's course list
    await this.updateOne(
        { _id: course.teacher },
        { $pull: { courses: courseId } }
    );

    // Delete all student submissions in the course
    await StudentSubmission.deleteMany({ course: courseId });

    // Delete all tasks in the course
    await Task.deleteMany({ course: courseId });

    // Delete all folders in the course
    for (const folderId of course.folders) {
        const folder = await Folder.findById(folderId);
        if (!folder) {
            continue; // Skip if folder not found
        }
        const materials = await Material.find({
            _id: { $in: folder.materials },
        });

        for (const material of materials) {
            // Delete the file from the filesystem if it exists
            if (material.filePath && fs.existsSync(material.filePath)) {
                fs.unlinkSync(material.filePath);
            }
            await material.deleteOne();
        }
        // Remove the folder from the course
        await folder.deleteOne();
    }
    // Finally, delete the course itself
    await this.findByIdAndDelete(courseId);
};

module.exports = model('Course', courseSchema);
