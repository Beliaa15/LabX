require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { swaggerUi, swaggerDocument } = require('./swagger');

const connectDB = require('./config/database'); // MongoDB connection
const redisClient = require('./config/redis');
const errorHandler = require('./middleware/errorHandler');


// Import routes
const authRoutes = require('./routes/authRoute');
const courseRoutes = require('./routes/courseRoute');
const userRoutes = require('./routes/userRoute');
const taskRoutes = require('./routes/taskRoute');

const app = express();

// CORS configuration - more permissive for development
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Allow localhost and development origins
        const allowedOrigins = [
            ...(process.env.ALLOWED_ORIGINS?.split(',') || [])
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            return callback(null, true);
        }
        
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

// Custom helmet configuration to allow iframes
app.use(helmet({
    frameguard: false, // Disable X-Frame-Options to allow iframes
    crossOriginEmbedderPolicy: false // Disable COEP for Unity WebGL
}));

// Custom security headers middleware
app.use((req, res, next) => {
    // Special handling for WebGL paths
    if (req.path.includes('/webgl') || req.path.includes('/webgl-tasks')) {
        // Remove X-Frame-Options to allow embedding in iframes
        res.removeHeader('X-Frame-Options');
        
        // Unity WebGL specific headers
        res.setHeader('Cross-Origin-Embedder-Policy', 'unsafe-none');
        res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
        
        // Very permissive CSP for Unity WebGL
        res.setHeader(
            'Content-Security-Policy',
            "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; " +
            "script-src * 'unsafe-inline' 'unsafe-eval' blob: data:; " +
            "connect-src * 'unsafe-inline' data: blob:; " +
            "img-src * data: blob: 'unsafe-inline'; " +
            "media-src * data: blob:; " +
            "frame-src * data: blob:; " +
            "child-src * data: blob:; " +
            "worker-src * data: blob: 'unsafe-inline'; " +
            "style-src * 'unsafe-inline' data:; " +
            "font-src * data: blob:;"
        );
        
        // Allow embedding in any iframe
        res.setHeader('X-Frame-Options', 'ALLOWALL');
        
        // Set permissive CORS headers for WebGL resources
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', '*');
        
    } else {
        // Regular CSP for other routes
        res.setHeader(
            'Content-Security-Policy',
            "default-src 'self'; " +
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
            "style-src 'self' 'unsafe-inline'; " +
            "img-src 'self' data: blob:; " +
            "connect-src 'self'; " +
            "frame-src 'self' data: blob:; " +
            "child-src 'self' data: blob:;"
        );
        
        // Allow same-origin framing for regular content
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    }
    
    next();
});

// Static file serving with proper headers
app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
}, express.static(path.join(__dirname, 'uploads')));

// WebGL static serving with permissive headers
app.use('/webgl', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.removeHeader('X-Content-Type-Options'); // Allow Unity to determine content types
    next();
}, express.static(path.join(__dirname, 'uploads/webgl')));

const webglStaticPath = process.env.NODE_ENV === 'production' 
    ? path.join(__dirname, 'frontend/public/webgl-tasks')
    : path.join(__dirname, '../frontend/public/webgl-tasks');

app.use('/webgl-tasks', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.removeHeader('X-Content-Type-Options');
    next();
}, express.static(webglStaticPath));

// Rate limiting (more permissive for development)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'development' ? 1000 : 100, // Higher limit for dev
    skip: (req) => {
        // Skip rate limiting for WebGL resources
        return req.path.includes('/webgl') || req.path.includes('/webgl-tasks');
    }
});
app.use(limiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve static files (including WebGL builds)
app.use('/static', express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.send('Welcome to the Educational Platform API');
});

// Global error handler
app.use(errorHandler);

// Connect to MongoDB and start the server
const startServer = async () => {
    try {
        await connectDB(); // Connect to MongoDB
        console.log('Database connected');

        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`CORS enabled for development origins`);
        });
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};

startServer();