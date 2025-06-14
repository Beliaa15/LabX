const multer = require('multer');
const path = require('path');
const fs = require('fs');

const createWebGLStorage = (taskId) => {
    return multer.diskStorage({
        destination: (req, file, cb) => {
            // Use absolute path that works in both Docker and local development
            const isDocker =
                process.env.NODE_ENV === 'production' ||
                fs.existsSync('/.dockerenv');

            let baseDir;
            if (isDocker) {
                // Docker container path
                baseDir = '/usr/src/app/frontend/public/webgl-tasks';
            } else {
                // Local development path
                baseDir = path.join(
                    __dirname,
                    '../../frontend/public/webgl-tasks'
                );
            }

            const dir = path.join(baseDir, taskId);

            console.log('Creating directory for WebGL files:', dir);

            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
                console.log('Directory created successfully:', dir);
            }

            cb(null, dir);
        },

        filename: (req, file, cb) => {
            const originalName = file.originalname.toLowerCase();
            let filename = file.originalname;

            console.log('Processing file:', originalName);

            if (
                originalName.includes('loader') ||
                originalName.includes('.loader.js')
            ) {
                filename = 'Build.loader.js';
            } else if (
                originalName.includes('framework') ||
                originalName.includes('.framework.js')
            ) {
                filename = 'Build.framework.js';
            } else if (
                originalName.includes('.data') ||
                originalName.endsWith('.data')
            ) {
                filename = 'Build.data';
            } else if (
                originalName.includes('.wasm') ||
                originalName.endsWith('.wasm')
            ) {
                filename = 'Build.wasm';
            }

            console.log('File will be saved as:', filename);
            cb(null, filename);
        },
    });
};

const webglFileFilter = (req, file, cb) => {
    console.log('Filtering file:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
    });

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
        console.log('File accepted:', file.originalname);
        return cb(null, true);
    } else {
        console.log('File rejected:', file.originalname);
        cb(
            new Error(
                'Only WebGL build files are allowed (loader.js, data, wasm, framework.js)'
            ),
            false
        );
    }
};

const createWebGLMulter = (taskId) => {
    console.log('Creating multer for task:', taskId);

    return multer({
        storage: createWebGLStorage(taskId),
        limits: {
            fileSize: 200 * 1024 * 1024, // 200 MB
            files: 4,
        },
        fileFilter: webglFileFilter,
    });
};

module.exports = createWebGLMulter;