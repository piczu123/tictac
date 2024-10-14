const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const http = require('http');
const socketIo = require('socket.io');
const routes = require('./routes'); // Now your single routes file

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
app.use('/', routes); // Use the combined routes

const queue = []; // Store players in the queue

// Socket.io setup
io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('joinQueue', (username) => {
        queue.push({ socket, username });
        console.log(`${username} joined the queue`);

        if (queue.length >= 2) {
            const player1 = queue.shift();
            const player2 = queue.shift();

            // Assign symbols
            player1.socket.emit('matchFound', { opponent: player2.username, symbol: 'X' });
            player2.socket.emit('matchFound', { opponent: player1.username, symbol: 'O' });
        }
    });

    socket.on('leaveQueue', (username) => {
        const index = queue.findIndex(player => player.socket === socket);
        if (index !== -1) {
            queue.splice(index, 1);
            console.log(`${username} left the queue`);
        }
    });

    socket.on('makeMove', (data) => {
        socket.broadcast.emit('moveMade', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        const index = queue.findIndex(player => player.socket === socket);
        if (index !== -1) {
            queue.splice(index, 1);
        }
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
