const { Schema, model } = require('mongoose');
const Task = require('./Task');
const StudentSubmission = require('./StudentSubmission');
const Folder = require('./Folder');

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

courseSchema.statics.deleteCourseAndAssociatedData = async (courseId) => {
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
    await Folder.deleteMany({ course: courseId });

    // Finally, delete the course itself
    await this.findByIdAndDelete(courseId);
}

module.exports = model('Course', courseSchema);
