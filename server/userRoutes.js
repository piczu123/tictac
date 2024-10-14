const express = require('express');
const router = express.Router();
const User = require('./userModel'); // Assuming you have a user model

// Registration route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const newUser = new User({ username, password });
        await newUser.save();
        res.status(201).send('User registered successfully');
    } catch (error) {
        res.status(500).send('Error registering user');
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user || user.password !== password) {
            return res.status(401).send('Invalid credentials');
        }
        req.session.username = username; // Store username in session
        res.status(200).send('Login successful');
    } catch (error) {
        res.status(500).send('Error logging in');
    }
});

module.exports = router;
