const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const client = require('../config/redis');
const User = require('../models/User');

const blacklistToken = async (token) => {
    const exp = jwt.decode(token).exp - Math.floor(Date.now() / 1000);
    await client.set(token, '1', { EX: exp });
};

exports.register = asyncHandler(async (req, res) => {
    const { email, password, firstName, lastName, phone } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    try {
        const user = new User({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
        });
        // Check if user already exists
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }
        throw err;
    }
});

exports.login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
        res.status(400).json({ error: 'Invalid credentials' });
        return;
    }

    if (!user.password) {
        res.status(400).json({
            error: 'User registered via Google. Use Google login.',
        });
        return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        res.status(400).json({ error: 'Invalid credentials' });
        return;
    }

    const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '8h' }
    );

    res.json({ token, user: { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role } });
});

exports.logout = asyncHandler(async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Blacklist the token
    try {
        await blacklistToken(token);
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Error blacklisting token:', err);
        res.status(500).json({ message: 'Error logging out' });
    }
});