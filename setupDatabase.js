const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE, password TEXT, wins INTEGER DEFAULT 0, losses INTEGER DEFAULT 0)");
    db.run("CREATE TABLE IF NOT EXISTS games (id INTEGER PRIMARY KEY AUTOINCREMENT, player1 TEXT, player2 TEXT, winner TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
});

db.close();
