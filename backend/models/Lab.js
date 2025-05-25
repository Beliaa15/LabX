const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LabSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    webglUrl: {
        type: String,
        default: null,
    },
    filePath: {
        type: String,
        required: true
    },
    // References to users
    teachers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    students: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        // We'll now embed student submissions directly in the lab document
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Lab', LabSchema);