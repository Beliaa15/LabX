const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createWebGLStorage = (taskId) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = path.join(__dirname, '../uploads/webgl', taskId);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            cb(null, dir);
        },

        filename: (req, file, cb) => {
            const originalName = file.originalname.toLowerCase();
            let filename = file.originalname;

            if (
                originalName.includes('loader') ||
                originalName.includes('.loader.js')
            )
                filename = 'Build.loader.js';
            else if (
                originalName.includes('framework') ||
                originalName.includes('.framework.js')
            )
                filename = 'Build.framework.js';
            else if (
                originalName.includes('.data') ||
                originalName.endsWith('.data')
            )
                filename = 'Build.data';
            else if (
                originalName.includes('.wasm') ||
                originalName.endsWith('.wasm')
            )
                filename = 'Build.wasm';

            cb(null, filename);
        },
    });
};

const webglFileFilter = (req, file, cb) => {
    const allowedExtensions = ['.js', '.wasm', '.data', '.unityweb', '.json'];

    const allowedMimeTypes = [
        'application/javascript',
        'application/wasm',
        'application/octet-stream',
        'text/javascript',
        'application/x-unityweb',
        'application/x-javascript',
        'application/json',
    ];

    const ext = path.extname(file.originalname).toLowerCase();
    const mimeType = file.mimetype;
    const fileName = file.originalname.toLowerCase();

    const isWebGLFile =
        allowedExtensions.includes(ext) ||
        allowedMimeTypes.includes(mimeType) ||
        fileName.includes('loader') ||
        fileName.includes('data') ||
        fileName.includes('wasm') ||
        fileName.includes('framework');

    if (isWebGLFile) {
        return cb(null, true);
    } else {
        cb(
            new Error(
                'Only WebGL build files are allowed (loader.js, data, wasm, framework.js)'
            ),
            false
        );
    }
};

const createWebGLMulter = (taskId) => {
    return multer({
        storage: createWebGLStorage(taskId),
        limits: {
            fileSize: 200 * 1024 * 1024, // 200 MB
            files: 4, // Limit to 8 files
        },
        fileFilter: webglFileFilter,
    });
};

module.exports = createWebGLMulter;
