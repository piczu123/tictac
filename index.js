const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const db = require('./database');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

let waitingPlayers = [];

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        await db.createUser(username, password);
        res.status(201).send('User created');
    } catch (err) {
        res.status(400).send('Error creating user');
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.getUser(username);
    if (user && user.password === password) {
        res.status(200).send('Login successful');
    } else {
        res.status(401).send('Invalid credentials');
    }
});

io.on('connection', (socket) => {
    console.log('New player connected');

    socket.on('joinGame', (username) => {
        if (waitingPlayers.length > 0) {
            const opponentSocketId = waitingPlayers.pop();
            socket.emit('startGame', { opponent: opponentSocketId });
            io.to(opponentSocketId).emit('startGame', { opponent: socket.id });
        } else {
            waitingPlayers.push(socket.id);
            socket.emit('waitingForOpponent');
        }
    });

    socket.on('makeMove', async (data) => {
        socket.to(data.opponentId).emit('moveMade', data);
        // Check for winner and update stats
        // Assuming you have logic to check the winner
        const winner = checkWinner(data.board); // Implement this function
        if (winner) {
            await db.updateUserStats(data.player, 'win');
            await db.updateUserStats(data.opponent, 'loss');
            io.to(data.opponentId).emit('gameOver', { winner });
            io.to(socket.id).emit('gameOver', { winner });
        }
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected');
        waitingPlayers = waitingPlayers.filter(id => id !== socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
