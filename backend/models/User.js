const { Schema, model } = require('mongoose');
const Course = require('./Course');
const Task = require('./Task');
const Folder = require('./Folder');
const Material = require('./Material');
const StudentSubmission = require('./StudentSubmission');
const fs = require('fs');

const userSchema = new Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please provide a valid email',
            ],
        },
        password: {
            type: String,
            // Not required to allow for OAuth authentication
        },
        googleId: {
            type: String,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['teacher', 'student', 'admin'],
            default: 'student',
        },
        phone: {
            type: String,
            match: [
                /^\+?[1-9]\d{1,14}$/,
                'Please provide a valid phone number',
            ],
        },
        courses: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Course',
            },
        ],
    },
    {
        timestamps: true,
    }
);

userSchema.statics.deleteUserAndAssociatedData = async function (userId) {
    const user = await this.findById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    // Check if the user is a teacher or student
    if (user.role === 'teacher') {
        // Find all courses by this teacher
        const teacherCourses = await Course.find({ teacher: userId });
        const courseIds = teacherCourses.map((course) => course._id);

        for (const course of teacherCourses) {
            for (const folderId of course.folders) {
                const folder = await Folder.findById(folderId);
                if (folder) {
                    // Delete all materials in the folder
                    for (const materialId of folder.materials) {
                        const material = await Material.findById(materialId);
                        if (material) {
                            // Delete the file from the filesystem if it exists
                            if (
                                material.filePath &&
                                fs.existsSync(material.filePath)
                            ) {
                                try {
                                    fs.unlinkSync(material.filePath);
                                } catch (err) {
                                    // Log error but continue deletion
                                    console.error('Error deleting file:', err);
                                }
                            }
                            await material.deleteOne();
                        }
                    }
                    // Delete the folder
                    await folder.deleteOne();
                }
            }
        }

        // Delete all tasks in teacher's courses
        // may remove it if tasks are creaded by admins
        await Task.deleteMany({ course: { $in: courseIds } });

        // Delete all submissions in teacher's courses
        await StudentSubmission.deleteMany({ course: { $in: courseIds } });

        // Remove courses from students' course lists
        await this.updateMany(
            { courses: { $in: courseIds } },
            { $pull: { courses: { $in: courseIds } } }
        );

        // Delete all courses by this teacher
        await Course.deleteMany({ teacher: userId });
    } else if (user.role === 'student') {
        // Remove student from all courses
        await Course.updateMany(
            { students: userId },
            { $pull: { students: userId } }
        );

        // Delete all submissions by this student
        await StudentSubmission.deleteMany({ student: userId });
    }

    // Finally, delete the user
    await this.findByIdAndDelete(userId);

    return {
        success: true,
        message: 'User and all associated data deleted successfully',
    };
};

module.exports = model('User', userSchema);
