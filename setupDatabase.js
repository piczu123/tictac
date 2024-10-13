const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tictactoe.db');

db.serialize(() => {
    // Create users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        elo INTEGER DEFAULT 1200
    )`);

    // Create games table
    db.run(`CREATE TABLE IF NOT EXISTS games (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player1_id INTEGER,
        player2_id INTEGER,
        winner_id INTEGER,
        FOREIGN KEY(player1_id) REFERENCES users(id),
        FOREIGN KEY(player2_id) REFERENCES users(id),
        FOREIGN KEY(winner_id) REFERENCES users(id)
    )`);

    // Create queue table
    db.run(`CREATE TABLE IF NOT EXISTS queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);
});

db.close();
