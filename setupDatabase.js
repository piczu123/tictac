const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./tictactoe.db');

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, elo INTEGER DEFAULT 100)");
});

db.close();
