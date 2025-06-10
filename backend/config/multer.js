const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = crypto.randomBytes(6).toString('hex');
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});

// File filter to allow only specific file types
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        // Images
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',

        // Documents
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
        'application/msword', // .doc
        'application/vnd.ms-powerpoint', // .ppt

        // Excel files
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'application/vnd.ms-excel', // .xls

        // Text files
        'text/plain', // .txt
        'text/csv', // .csv
        'application/rtf', // .rtf

        // Audio files
        'audio/mpeg', // .mp3
        'audio/wav', // .wav
        'audio/ogg', // .ogg
        'audio/mp4', // .m4a
        'audio/aac', // .aac
        'audio/flac', // .flac
        'audio/x-ms-wma', // .wma

        // Videos
        'video/mp4',
        'video/mpeg',
        'video/quicktime', // .mov
        'video/x-msvideo', // .avi
        'video/x-ms-wmv', // .wmv
        'video/webm',
    ];

    const allowedExtensions =
        /\.(jpeg|jpg|png|gif|pdf|docx|pptx|doc|ppt|xlsx|xls|txt|csv|rtf|mp3|wav|ogg|m4a|aac|flac|wma|mp4|mpeg|mpg|mov|avi|wmv|webm)$/i;

    const extname = allowedExtensions.test(
        path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedMimeTypes.includes(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images and documents are allowed!'), false);
    }
};

// Create the multer upload instance
const upload = multer({
    storage: storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // Limit file size to 500 MB
    fileFilter: fileFilter,
});

module.exports = upload;
