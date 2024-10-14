const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { setupDatabase } = require('./setupDatabase');
const { login, register } = require('./routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

setupDatabase();

app.post('/login', login);
app.post('/register', register);

app.get('/queue.html', (req, res) => res.sendFile(path.join(__dirname, '../public/queue.html')));
app.get('/game.html', (req, res) => res.sendFile(path.join(__dirname, '../public/game.html')));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
