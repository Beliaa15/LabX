// middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Authenticate user from JWT token
 */
const authenticate = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: 'error',
            message: 'Authentication required'
        });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                status: 'error',
                message: 'Invalid or expired token'
            });
        }
        req.user = user;
        next();
    });
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
        const allowedRoles = Array.isArray(roles) ? roles : [roles];

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