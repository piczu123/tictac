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
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true
}));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/', routes);

// Socket.io setup
let waitingPlayers = []; // Array to hold players waiting for a game

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinQueue', (username) => {
        waitingPlayers.push({ socketId: socket.id, username });
        console.log(`${username} joined the queue`);

        if (waitingPlayers.length > 1) {
            const player1 = waitingPlayers.shift();
            const player2 = waitingPlayers.shift();
            io.to(player1.socketId).emit('matchFound', player2.username);
            io.to(player2.socketId).emit('matchFound', player1.username);
        }
    });

    socket.on('disconnect', () => {
        waitingPlayers = waitingPlayers.filter(player => player.socketId !== socket.id);
        console.log('User disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
