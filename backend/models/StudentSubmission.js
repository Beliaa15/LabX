// models/StudentSubmission.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSubmissionSchema = new Schema(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        task: {
            type: Schema.Types.ObjectId,
            ref: 'Task',
            required: true,
        },
        grade: {
            type: Number,
            default: null,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('StudentSubmission', studentSubmissionSchema);
