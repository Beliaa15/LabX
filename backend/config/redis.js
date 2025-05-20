const redis = require('redis');

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

const client = redis.createClient({
    url: redisUrl,
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 50, 2000),
    },
});

client.on('error', (err) => console.error('Redis error:', err));

client.connect()
    .then(() => console.log('Connected to Redis'))
    .catch((err) => console.error('Redis connection error:', err));

module.exports = client;
