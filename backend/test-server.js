// Simple server test without database dependencies
const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/ping', (req, res) => {
    res.status(200).send('pong');
});

app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        env: process.env.NODE_ENV || 'development',
        port: PORT
    });
});

app.get('/', (req, res) => {
    res.send('Test server is running!');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Test server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/ping`);
});

// Keep process alive
setInterval(() => {
    console.log('Server heartbeat:', new Date().toISOString());
}, 30000);
