const {Schema, model} = require('mongoose');

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
    },
    {
        timestamps: true,
    }
);

module.exports = model('User', userSchema);
