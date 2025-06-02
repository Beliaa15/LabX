const { Schema, model } = require('mongoose');

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

module.exports = model('Course', courseSchema);
