const { Schema, model } = require('mongoose');

const materialSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        filePath: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = model('Material', materialSchema);