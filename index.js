const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const db = new sqlite3.Database('./tictactoe.db');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));

// Bind to the port from the environment, or default to 3000 if not set
const PORT = process.env.PORT || 3000;

let rooms = {};

// User Registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    db.run(`INSERT INTO users (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) {
            return res.status(400).json({ error: 'User already exists' });
        }
        res.status(201).json({ id: this.lastID });
    });
});

// User Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
        if (err || !user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        req.session.userId = user.id; // Store user ID in session
        res.json({ id: user.id, elo: user.elo });
    });
});

// Matchmaking Queue
app.post('/join-queue', (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    db.run(`INSERT INTO queue (user_id) VALUES (?)`, [userId], function(err) {
        if (err) return res.status(400).json({ error: 'Could not join queue' });
        res.json({ message: 'Joined queue', id: this.lastID });
    });

    // Matchmaking Logic
    db.all(`SELECT user_id FROM queue`, (err, rows) => {
        if (rows.length >= 2) {
            const player1Id = rows[0].user_id;
            const player2Id = rows[1].user_id;

            // Remove players from the queue
            db.run(`DELETE FROM queue WHERE user_id IN (?, ?)`, [player1Id, player2Id]);

            // Create a new room and start the game
            const roomName = `room_${player1Id}_${player2Id}`;
            rooms[roomName] = { players: [{ id: player1Id, symbol: 'X' }, { id: player2Id, symbol: 'O' }], board: Array(15).fill(null).map(() => Array(15).fill(null)), lastMove: null, turn: 'X' };

            io.to(roomName).emit('startGame', rooms[roomName].players);
        }
    });
});

// WebSocket Connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('makeMove', (roomName, x, y, playerSymbol) => {
        const room = rooms[roomName];
        if (room && room.board[x][y] === null && room.turn === playerSymbol) {
            room.board[x][y] = playerSymbol;
            room.lastMove = { x, y, playerSymbol };

            // Switch turn
            room.turn = playerSymbol === 'X' ? 'O' : 'X';

            io.to(roomName).emit('moveMade', room.board, room.lastMove);
            checkWin(roomName, x, y, playerSymbol);
        }
    });
});

// ELO Calculation
function calculateELO(winnerId, loserId) {
    const K = 32; // K-factor
    db.get(`SELECT elo FROM users WHERE id = ?`, [winnerId], (err, winner) => {
        if (err) return console.error(err);
        db.get(`SELECT elo FROM users WHERE id = ?`, [loserId], (err, loser) => {
            if (err) return console.error(err);
            const expectedWinner = 1 / (1 + Math.pow(10, (loser.elo - winner.elo) / 400));
            const expectedLoser = 1 / (1 + Math.pow(10, (winner.elo - loser.elo) / 400));
            const newWinnerELO = Math.round(winner.elo + K * (1 - expectedWinner));
            const newLoserELO = Math.round(loser.elo + K * (0 - expectedLoser));
            db.run(`UPDATE users SET elo = ? WHERE id = ?`, [newWinnerELO, winnerId]);
            db.run(`UPDATE users SET elo = ? WHERE id = ?`, [newLoserELO, loserId]);
        });
    });
}

// Win Check Logic
const checkWin = (roomName, x, y, playerSymbol) => {
    const room = rooms[roomName];
    const directions = [
        { x: 1, y: 0 },  // Horizontal
        { x: 0, y: 1 },  // Vertical
        { x: 1, y: 1 },  // Diagonal \
        { x: 1, y: -1 }  // Diagonal /
    ];
    for (const { x: dx, y: dy } of directions) {
        let count = 1; // Count the current move
        // Check in both directions
        for (let dir = -1; dir <= 1; dir += 2) {
            let nx = x, ny = y;
            while (true) {
                nx += dx * dir;
                ny += dy * dir;
                if (nx < 0 || ny < 0 || nx >= 15 || ny >= 15 || room.board[nx][ny] !== playerSymbol) {
                    break;
                }
                count++;
            }
        }
        if (count >= 5) {
            room.winnerId = playerSymbol === 'X' ? room.players[0].id : room.players[1].id;
            calculateELO(room.winnerId, room.winnerId === room.players[0].id ? room.players[1].id : room.players[0].id);
            io.to(roomName).emit('gameOver', playerSymbol);
            return;
        }
    }
};

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
