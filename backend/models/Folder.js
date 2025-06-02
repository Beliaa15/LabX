const { Schema, model } = require('mongoose');

const folderSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        materials: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Material',
            },
        ],
    },
    { timestamps: true }
);

module.exports = model('Folder', folderSchema);
