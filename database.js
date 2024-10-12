const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./tictactoe/tictactoe.db');

// Create players table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0,
        elo INTEGER DEFAULT 1000
    );`);
});

module.exports = db;
