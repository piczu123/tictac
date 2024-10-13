const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'tictactoe.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to the database');
    }
});

// Function to initialize the database tables
const initializeDatabase = () => {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )
    `;
    
    db.run(createUsersTable, (err) => {
        if (err) {
            console.error('Error creating users table', err);
        }
    });
};

// Call the function to initialize the database
initializeDatabase();

module.exports = db; // Export the database instance for use in other files
