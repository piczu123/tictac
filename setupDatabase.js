// setupDatabase.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT,
        wins INTEGER DEFAULT 0,
        losses INTEGER DEFAULT 0
    )`);

    // Create games table
    db.run(`CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player1 INTEGER,
        player2 INTEGER,
        winner INTEGER,
        FOREIGN KEY(player1) REFERENCES users(id),
        FOREIGN KEY(player2) REFERENCES users(id),
        FOREIGN KEY(winner) REFERENCES users(id)
    )`);
});

db.close();
