const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const db = new sqlite3.Database(':memory:');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));

// Serve login/register page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve queue page
app.get('/queue', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'queue.html'));
});

// Handle registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function (err) {
        if (err) {
            return res.status(400).send('User already exists.');
        }
        res.redirect('/queue'); // Redirect to the queue page
    });
});

// Handle login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err || !user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).send('Login failed');
        }
        res.redirect('/queue'); // Redirect to the queue page
    });
});

// Initialize database
db.serialize(() => {
    db.run('CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT, password TEXT)');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
