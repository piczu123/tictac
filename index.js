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
            return res.status(400).send({ success: false, message: 'User already exists or invalid data.' });
        }
        res.status(201).send({ success: true, id: this.lastID });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';

    db.get(sql, [username, password], (err, row) => {
        if (err || !row) {
            return res.status(401).send({ success: false, message: 'Invalid username or password.' });
        }
        req.session.userId = row.id;
        res.send({ success: true, message: 'Logged in successfully.', username });
    });
});

// Matchmaking logic
const matchmakingQueue = []; // Array to hold players in the queue

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinQueue', (username) => {
        matchmakingQueue.push({ socketId: socket.id, username });
        console.log(`${username} joined the queue.`);

        // Check if there is another player to match with
        if (matchmakingQueue.length >= 2) {
            const player1 = matchmakingQueue.shift();
            const player2 = matchmakingQueue.shift();

            // Create a room for the matched players
            const roomId = `${player1.socketId}-${player2.socketId}`;
            socket.join(roomId);
            io.to(roomId).emit('startGame', {
                player1: player1.username,
                player2: player2.username,
                roomId,
            });

            console.log(`Matched ${player1.username} with ${player2.username} in room ${roomId}`);
        }
    });

    socket.on('makeMove', ({ roomId, player, position }) => {
        // Emit the move to the other player
        socket.to(roomId).emit('moveMade', { player, position });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Remove the player from the matchmaking queue if necessary
        const index = matchmakingQueue.findIndex(player => player.socketId === socket.id);
        if (index !== -1) {
            const removedPlayer = matchmakingQueue.splice(index, 1);
            console.log(`${removedPlayer.username} left the queue.`);
        }
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
