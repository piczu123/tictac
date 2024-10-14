// server/routes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('./userModel'); // Ensure you import User correctly

// Registration route
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    
    try {
        const newUser = new User({ username, password: hashedPassword }); // Use User here
        await newUser.save();
        res.json({ success: true });
    } catch (err) {
        console.error(err); // Log error for debugging
        if (err.code === 11000) {
            res.json({ success: false, message: 'Username already exists.' });
        } else {
            res.json({ success: false, message: 'An error occurred during registration.' });
        }
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username }); // Use User here
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.username = username; // Store username in session
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error(err); // Log error for debugging
        res.json({ success: false, message: 'An error occurred during login.' });
    }
});

// Logout route
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/'); // Redirect after logout
});

// Export the router
module.exports = router;
