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
        
        // Development origins
        const developmentOrigins = [
            'http://localhost:3001',  // React development server
            'http://127.0.0.1:3001',
            'http://localhost:3000',  // Backend development
            'http://127.0.0.1:3000'
        ];
        
        // Production origins
        const allowedOrigins = [
            ...developmentOrigins,
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

// Serve uploaded files and WebGL content
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/webgl', express.static(path.join(__dirname, 'uploads/webgl')));

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

// Health check endpoint - MUST be before database-dependent routes
app.get('/health', (req, res) => {
    const healthStatus = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        env: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3000,
        memory: process.memoryUsage(),
        version: require('./package.json').version || '1.0.0'
    };
    
    res.status(200).json(healthStatus);
});

// Simple ping endpoint for basic connectivity
app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

// Ready check endpoint (includes database status)
app.get('/ready', async (req, res) => {
    try {
        // Check if we can import mongoose without error
        const mongoose = require('mongoose');
        const dbStatus = mongoose.connection.readyState;
        
        const readyStatus = {
            status: dbStatus === 1 ? 'READY' : 'NOT_READY',
            database: dbStatus === 1 ? 'connected' : 'disconnected',
            timestamp: new Date().toISOString()
        };
        
        res.status(dbStatus === 1 ? 200 : 503).json(readyStatus);
    } catch (error) {
        res.status(503).json({
            status: 'ERROR',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve static files (including WebGL builds)
app.use('/static', express.static('public'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);

// Serve static files from the React app build directory
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'frontend/build')));
    
    // Handle React routing, return all requests to React app (except API routes)
    app.get('*', (req, res) => {
        // Skip API routes and health checks
        if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/ping')) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
    });
} else {
    // Root endpoint for development
    app.get('/', (req, res) => {
        res.send('Welcome to the Educational Platform API');
    });
}

// Global error handler
app.use(errorHandler);

// Start server immediately, connect to database in background
const startServer = async () => {
    const PORT = process.env.PORT || 3000;
    
    console.log('🚀 Starting server...');
    console.log('📊 Environment variables:');
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('  - PORT:', PORT);
    console.log('  - MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    console.log('  - Redis URL:', process.env.REDIS_URL ? 'Set' : 'Not set');
    
    // Start server first (for health checks)
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`🔗 Health check: http://localhost:${PORT}/ping`);
    });

    // Connect to database in background
    try {
        console.log('🔄 Connecting to database...');
        await connectDB();
        console.log('✅ Database connected successfully');
    } catch (err) {
        console.error('❌ Database connection error:', err.message);
        console.log('⚠️ Server running without database connection');
        // Don't exit - allow health checks to work
    }

    return server;
};

startServer();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('❌ Uncaught Exception:', error);
    console.log('🔄 Server continuing to run...');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
    console.log('🔄 Server continuing to run...');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT received, shutting down gracefully');
    process.exit(0);
});