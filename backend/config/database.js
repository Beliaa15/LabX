const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
        if (!mongoUri) {
            throw new Error('MongoDB URI not provided');
        }
        
        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000, // Timeout after 10s
            maxPoolSize: 10, // Maintain up to 10 socket connections
            bufferCommands: false, // Disable buffering
            bufferMaxEntries: 0 // Disable buffering
        });
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        throw error; // Don't exit process, let caller handle it
    }
};

module.exports = connectDB;