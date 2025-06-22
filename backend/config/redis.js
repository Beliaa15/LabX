const redis = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let client = null;

try {
    client = redis.createClient({
        url: redisUrl,
        socket: {
            reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
            connectTimeout: 10000, // 10 second timeout
        },
    });

    client.on('error', (err) => {
        console.error('❌ Redis error:', err.message);
    });

    client.on('connect', () => {
        console.log('✅ Connected to Redis');
    });

    // Connect in background, don't block server startup
    client.connect().catch((err) => {
        console.error('❌ Redis connection error:', err.message);
        console.log('⚠️ Server running without Redis');
    });

} catch (error) {
    console.error('❌ Redis client creation error:', error.message);
    console.log('⚠️ Server running without Redis');
}

module.exports = client;