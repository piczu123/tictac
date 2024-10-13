const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');

const db = new sqlite3.Database('./tictactoe.db');

app.use(express.static('public'));
app.use(express.json());

// Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true }));

// Set up the database
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, elo INTEGER DEFAULT 100)");
});

// User registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function (err) {
        if (err) {
            return res.status(400).send("User already exists");
        }
        res.status(201).send({ id: this.lastID, username });
    });
});

// User login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
        if (err || !user) {
            return res.status(400).send("User not found");
        }
        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(400).send("Incorrect password");
        }
        res.send({ id: user.id, username: user.username, elo: user.elo });
    });
});

// Socket.IO for real-time game interaction
io.on('connection', (socket) => {
    console.log('a user connected');
    
    // Handle game matchmaking logic here
    socket.on('joinQueue', (username) => {
        socket.username = username;
        // Logic for joining a queue and matching players
    });

    // Add more socket event handlers for game actions, etc.
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});
