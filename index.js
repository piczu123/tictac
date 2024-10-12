const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./tictactoe/tictactoe.db');

app.use(express.static('public'));
app.use(express.json());

// Update player stats after a match
function updatePlayerStats(winnerName, loserName) {
    const eloChange = 30; // Change in Elo rating
    db.serialize(() => {
        // Update winner's stats
        db.run(`INSERT INTO players (name, wins, losses, elo) VALUES (?, 1, 0, ?) 
                ON CONFLICT(name) DO UPDATE SET wins = wins + 1, elo = elo + ?`, 
                [winnerName, eloChange, eloChange]);

        // Update loser's stats
        db.run(`INSERT INTO players (name, wins, losses, elo) VALUES (?, 0, 1, ?) 
                ON CONFLICT(name) DO UPDATE SET losses = losses + 1, elo = elo - ?`, 
                [loserName, eloChange, eloChange]);
    });
}

// Get leaderboard
function getLeaderboard(callback) {
    db.all(`SELECT name, wins, losses, elo FROM players ORDER BY elo DESC`, [], (err, rows) => {
        if (err) {
            throw err;
        }
        callback(rows);
    });
}

// Route to get the leaderboard
app.get('/leaderboard', (req, res) => {
    getLeaderboard((data) => {
        res.json(data);
    });
});

// Example route for updating player stats
app.post('/updateStats', (req, res) => {
    const { winner, loser } = req.body;
    updatePlayerStats(winner, loser);
    res.sendStatus(200);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
