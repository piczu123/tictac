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

const queue = []; // Store players in the queue

// Socket.io setup
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinQueue', (username) => {
        // Add player to the queue
        queue.push({ socket, username });
        console.log(`${username} joined the queue`);

        // Check if we have enough players for a match
        if (queue.length >= 2) {
            const player1 = queue.shift(); // First player
            const player2 = queue.shift(); // Second player

            // Emit event to both players that a match has been found
            player1.socket.emit('matchFound', { opponent: player2.username });
            player2.socket.emit('matchFound', { opponent: player1.username });

            // You can also emit the room info or game state here if needed
        }
    });

    socket.on('leaveQueue', (username) => {
        const index = queue.findIndex(player => player.socket === socket);
        if (index !== -1) {
            queue.splice(index, 1); // Remove player from queue
            console.log(`${username} left the queue`);
        }
    });

    socket.on('makeMove', (data) => {
        // Broadcast move to the opponent
        socket.broadcast.emit('moveMade', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        const index = queue.findIndex(player => player.socket === socket);
        if (index !== -1) {
            queue.splice(index, 1); // Remove player from queue on disconnect
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
