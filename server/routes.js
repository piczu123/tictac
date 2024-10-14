const express = require('express');
const router = express.Router();

let users = []; // Temporary user storage; replace with a real database for production

function login(req, res) {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username && user.password === password);
    if (user) {
        req.session.username = username; // Store username in session
        res.json({ success: true });
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

router.post('/login', login);
router.post('/register', register);

module.exports = router;
