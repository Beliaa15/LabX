const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../uploads/webgl');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname.toLowerCase());
    },
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        'application/zip',
        'application/x-zip-compressed',
        'application/octet-stream',
        'application/x-zip',
    ]

    const allowedExtensions =
        /\.zip$/i;

    const extname = allowedExtensions.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only zip files are allowed'), false);
    }
};

// Create the multer upload instance
const upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // Limit file size to 500 MB
    fileFilter: fileFilter,
});

module.exports = upload;
