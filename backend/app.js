require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const connectDB = require('./config/database'); // MongoDB connection
const redisClient = require('./config/redis'); // Redis client
const errorHandler = require('./middleware/errorHandler');


// Import routes
const authRoutes = require('./routes/authRoute');
const labRoutes = require('./routes/labRoute');
const userRoutes = require('./routes/userRoute');


const app = express();

// Security middleware and JSON parsing
app.use(helmet());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Serve static files (including WebGL builds)
app.use('/static', express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/labs', labRoutes);
app.use('/api/users', userRoutes);


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