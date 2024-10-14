const express = require('express');
const path = require('path');
const router = express.Router();
let users = []; // Temporary user storage, use a real database for production

function login(req, res) {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        req.session.username = username; // Store username in session
        res.redirect('/queue'); // Redirect to the queue page
    } else {
        res.json({ success: false, message: 'Invalid credentials' });
    }
}

function register(req, res) {
    const { username, password } = req.body;
    if (users.some(user => user.username === username)) {
        res.json({ success: false, message: 'Username already exists' });
    } else {
        users.push({ username, password });
        res.json({ success: true });
    }
}

// Define your routes
router.post('/login', login);
router.post('/register', register);
router.get('/queue', (req, res) => {
    if (req.session.username) {
        res.sendFile(path.join(__dirname, '../public/queue.html'));
    } else {
        res.redirect('/'); // Redirect to home if not logged in
    }
});

module.exports = router;
