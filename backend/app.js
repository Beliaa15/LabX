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

// Security middleware and JSON parsing
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const webglStaticPath = process.env.NODE_ENV === 'production' 
    ? path.join(__dirname, 'frontend/public/webgl-tasks')
    : path.join(__dirname, '../frontend/public/webgl-tasks');

app.use('/webgl-tasks', express.static(webglStaticPath));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Serve static files (including WebGL builds)
app.use('/static', express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
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
        });
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1);
    }
};

startServer();