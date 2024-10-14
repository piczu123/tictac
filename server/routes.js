const express = require('express');
const router = express.Router(); // Create a router instance

let users = []; // Temporary user storage, use a real database for production

// Define the login route
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
});

// Define the register route
router.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users.some(user => user.username === username)) {
        res.json({ success: false, message: 'Username already exists' });
    } else {
        users.push({ username, password });
        res.json({ success: true });
    }
});

// Export the router
module.exports = router;
