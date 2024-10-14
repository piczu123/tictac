const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const routes = require('./routes');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'yourSecretKey', // Change this to a secure random string
    resave: false,
    saveUninitialized: true
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/', routes);

// Socket.io setup
let waitingPlayers = [];

// Handle player connections
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinQueue', () => {
        socket.join('queue');
        console.log('User joined the queue');
        waitingPlayers.push(socket.id);

        // Try to find a match
        if (waitingPlayers.length >= 2) {
            const player1 = waitingPlayers.shift();
            const player2 = waitingPlayers.shift();
            const currentPlayer = Math.random() > 0.5 ? 'X' : 'O';

            io.to(player1).emit('startGame', { currentPlayer: currentPlayer, opponent: player2 });
            io.to(player2).emit('startGame', { currentPlayer: currentPlayer === 'X' ? 'O' : 'X', opponent: player1 });
            console.log('Match found');
        }
    });

    socket.on('makeMove', (data) => {
        // Broadcast the move to the opponent
        socket.to('game').emit('moveMade', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        waitingPlayers = waitingPlayers.filter(player => player !== socket.id);
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
