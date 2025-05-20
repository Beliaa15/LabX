const express = require('express');
const jwt = require('jsonwebtoken');
const passport = require('passport');
require('../config/passport'); 
const { body, validationResult } = require('express-validator');
const { signup, login } = require('../controllers/authController');

const router = express.Router();
//signup
router.post(
    '/signup',
    [
        body('email').isEmail().withMessage('Enter a valid email'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('name').notEmpty().withMessage('Name is required'),
        body('year').isInt().withMessage('Year must be an integer'),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    signup
);
//login
router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Enter a valid email'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    login
);

// Google OAuth routes
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/api/auth/login' }),
    (req, res) => {
        // Issue a JWT after successful Google login
        const token = jwt.sign(
            { id: req.user.id, email: req.user.email },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: '1h' }
        );
        res.json({ token });
    }
);

module.exports = router;
