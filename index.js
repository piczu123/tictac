const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: 'your_secret_key', // Change this to a secure key in production
    resave: false,
    saveUninitialized: true,
}));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Database setup
const db = new sqlite3.Database('./tictactoe.db', (err) => {
    if (err) {
        console.error('Error opening database: ' + err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Registration endpoint
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';

    db.run(sql, [username, password], function (err) {
        if (err) {
            return res.status(400).send('User already exists or invalid data.');
        }
        res.status(201).send({ id: this.lastID });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';

    db.get(sql, [username, password], (err, row) => {
        if (err || !row) {
            return res.status(401).send('Invalid username or password.');
        }
        req.session.userId = row.id;
        res.send({ message: 'Logged in successfully.' });
    });
});

// WebSocket connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle game logic here (room creation, joining, moves, etc.)
    
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling for database
db.on('error', (err) => {
    console.error('Database error:', err.message);
});

// Start server
const PORT = process.env.PORT || 14053;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
