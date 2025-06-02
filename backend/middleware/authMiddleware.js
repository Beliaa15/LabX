// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const client = require('../config/redis');

/**
 * Authenticate user from JWT token
 */
const authenticate = async (req, res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = header.split(' ')[1];
    console.log('Token:', token);
    if (await client.get(token))
            return res.status(401).json({ message: 'Token invalidated' });
    try {
        const decodedToken = jwt.decode(token, process.env.ACCESS_TOKEN_SECRET);
        req.userId = decodedToken.id;
        req.user = await User.findById(req.userId).select('-password -__v');
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

/**
 * Authorize based on user roles
 * @param {string|string[]} roles - Single role or array of allowed roles
 */
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        // Convert single role to array
        const allowedRoles = ['admin'];

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                status: 'error',
                message: `Access denied. Requires ${allowedRoles.join(' or ')} role`
            });
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorize
};