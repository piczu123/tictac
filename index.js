const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcrypt');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const db = new sqlite3.Database('./tictactoe.db');
let waitingPlayers = [];

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('register', async ({ username, password }) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
            if (err) {
                socket.emit('loginError', 'Username already exists.');
            } else {
                socket.emit('registerSuccess');
            }
        });
    });

    socket.on('login', async (username) => {
        db.get(`SELECT password FROM users WHERE username = ?`, [username], async (err, row) => {
            if (err || !row) {
                socket.emit('loginError', 'Username does not exist.');
                return;
            }
            const isMatch = await bcrypt.compare(password, row.password);
            if (isMatch) {
                socket.username = username;
                socket.emit('loginSuccess', username);
                // Remove from waiting players on successful login
                waitingPlayers = waitingPlayers.filter(p => p !== username);
            } else {
                socket.emit('loginError', 'Invalid password.');
            }
        });
    });

    socket.on('findOpponent', (username) => {
        if (waitingPlayers.includes(username)) return; // Already in queue
        waitingPlayers.push(username);
        socket.join(username);
        if (waitingPlayers.length > 1) {
            const opponent = waitingPlayers.shift();
            startGame(username, opponent);
        }
    });

    socket.on('makeMove', ({ index, player }) => {
        const nextPlayer = (player === 'X') ? 'O' : 'X';
        io.to(player).emit('moveMade', { index, player, nextTurn: nextPlayer });
        // Add win condition check here
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        waitingPlayers = waitingPlayers.filter(p => p !== socket.username);
    });
});

function startGame(player1, player2) {
    io.to(player1).emit('opponentFound', player2);
    io.to(player2).emit('opponentFound', player1);
}

const PORT = process.env.PORT || 14053;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
