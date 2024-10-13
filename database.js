const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

const createUser = (username, password) => {
    return new Promise((resolve, reject) => {
        db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, password], function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
        });
    });
};

const getUser = (username) => {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
};

const updateUserStats = (username, result) => {
    const query = result === 'win' ?
        "UPDATE users SET wins = wins + 1 WHERE username = ?" :
        "UPDATE users SET losses = losses + 1 WHERE username = ?";
    return new Promise((resolve, reject) => {
        db.run(query, [username], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
};

const getLeaderboard = () => {
    return new Promise((resolve, reject) => {
        db.all("SELECT username, wins, losses FROM users ORDER BY wins DESC", [], (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

module.exports = {
    createUser,
    getUser,
    updateUserStats,
    getLeaderboard
};
