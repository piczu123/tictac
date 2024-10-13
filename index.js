// index.js
const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

const db = new sqlite3.Database('./database.db');

// Register user
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Login user
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, row) => {
        if (err || !row) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        res.json({ id: row.id, username: row.username });
    });
});

// Get leaderboard
app.get('/leaderboard', (req, res) => {
    db.all('SELECT username, wins, losses FROM users ORDER BY wins DESC', [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Update game results
app.post('/update-game', (req, res) => {
    const { winnerId, player1Id, player2Id } = req.body;
    db.run('INSERT INTO games (player1, player2, winner) VALUES (?, ?, ?)', [player1Id, player2Id, winnerId], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        db.run('UPDATE users SET wins = wins + 1 WHERE id = ?', [winnerId]);
        db.run('UPDATE users SET losses = losses + 1 WHERE id = ?', [winnerId === player1Id ? player2Id : player1Id]);
        res.json({ gameId: this.lastID });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
