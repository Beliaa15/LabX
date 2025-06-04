const { Schema, model } = require('mongoose');
const Course = require('./Course');
const Task = require('./Task');
const StudentSubmission = require('./StudentSubmission');

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

        // Delete all tasks in teacher's courses
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
