const { Schema, model } = require('mongoose');

const taskSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        courseTasks: [
            {
                course: {
                    type: Schema.Types.ObjectId,
                    ref: 'Course',
                    required: true,
                },
                dueDate: {
                    type: Date,
                    required: true,
                },
                assingedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        submissions: [
            {
                type: Schema.Types.ObjectId,
                ref: 'StudentSubmission',
            },
        ],
        webglUrl: {
            type: String,
            default: null,
        },
        score: {
            type: Number,
            default: 100,
        },
    },
    { timestamps: true }
);

module.exports = model('Task', taskSchema);
