const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = process.env.PORT || 3000;
const db = require('./database');

// Use db to perform queries, e.g., adding users, fetching user data, etc.


// Middleware
app.use(bodyParser.json());
app.use(express.static('public'));

let users = []; // In-memory user storage (replace with a database in production)

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(user => user.username === username);
    
    if (user && bcrypt.compareSync(password, user.password)) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Invalid username or password' });
    }
});

// Registration route
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const existingUser = users.find(user => user.username === username);
    
    if (existingUser) {
        return res.json({ success: false, message: 'Username already taken' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);
    users.push({ username, password: hashedPassword });
    res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
