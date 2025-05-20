
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        // Not required to allow for OAuth authentication
    },
    googleId: {
        type: String
    },
    name: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    role: {
        type: String,
        enum: ['teacher', 'student', 'admin'],
        default: 'student'
    },
    // References to other collections
    enrolledLabs: [{
        type: Schema.Types.ObjectId,
        ref: 'Lab'
    }],
    teachingLabs: [{
        type: Schema.Types.ObjectId,
        ref: 'Lab'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);