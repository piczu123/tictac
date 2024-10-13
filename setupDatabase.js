const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tictactoe.db');

// Set up any initial data or tables here if needed
db.run('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)');

db.close();
