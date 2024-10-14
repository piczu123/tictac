const express = require('express');
const router = express.Router();
const User = require('../models/userModel'); // Adjust the path as necessary
const UserModel = require('./userModel');
// User registration route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('User already exists');
        }

        // Create a new user (ensure to hash the password)
        const newUser = new User({
            username,
            password // Hash the password before saving
        });

        await newUser.save();
        return res.status(201).send('User registered successfully');
    } catch (error) {
        console.error('Error registering user:', error);
        return res.status(500).send('Server error');
    }
});

// User login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Check password (ensure you hash passwords when saving and compare hashes here)
        if (user.password !== password) { // Use bcrypt to compare hashed passwords
            return res.status(401).send('Invalid password');
        }

        // Create a session for the user
        req.session.username = user.username; // Example of session usage
        return res.send('User logged in successfully');
    } catch (error) {
        console.error('Error logging in user:', error);
        return res.status(500).send('Server error');
    }
});

// Example route for the main page or dashboard
router.get('/dashboard', (req, res) => {
    if (!req.session.username) {
        return res.status(401).send('Please log in first');
    }
    res.send(`Welcome to your dashboard, ${req.session.username}!`);
});

// Other application routes can be added here
router.get('/some-other-route', (req, res) => {
    res.send('This is another route');
});

// You can add more routes as needed...

module.exports = router;
