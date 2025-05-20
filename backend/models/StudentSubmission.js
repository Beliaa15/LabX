// models/StudentSubmission.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSubmissionSchema = new Schema({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    lab: {
        type: Schema.Types.ObjectId,
        ref: 'Lab',
        required: true
    },
    grade: {
        type: Number,
        default: null
    },
    submissionFilePath: {
        type: String,
        default: null
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('StudentSubmission', StudentSubmissionSchema);