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

// Function to set up the database
const setupDatabase = () => {
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
        } else {
            console.log('Users table created or already exists');
        }
    });

    // You can add more tables or initial data here as needed.
};

// Call the function to set up the database
setupDatabase();

// Close the database connection
db.close((err) => {
    if (err) {
        console.error('Error closing the database connection', err);
    } else {
        console.log('Database connection closed');
    }
});
