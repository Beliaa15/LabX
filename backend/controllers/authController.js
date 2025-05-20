const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.signup = asyncHandler(async (req, res) => {
    const { email, password, name, year } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = new User({ email, password: hashedPassword, name, year });
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
        res.status(400).json({ error: 'User registered via Google. Use Google login.' });
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

    res.json({ token });
});
