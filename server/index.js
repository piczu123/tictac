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

// Set view engine if using EJS templates (if necessary)
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', routes);

// Socket.io setup
io.on('connection', (socket) => {
    console.log('A user connected');

    // Join the queue
    socket.on('joinQueue', (username) => {
        socket.join('queue');
        socket.username = username;
        console.log(`${username} joined the queue`);

        // Check if another player is already in the queue
        const clients = Array.from(io.sockets.adapter.rooms.get('queue') || []);
        if (clients.length === 2) {
            const player1 = clients[0];
            const player2 = clients[1];
            io.to(player1).emit('startGame', socket.username);
            io.to(player2).emit('startGame', socket.username);
        }
    });

    // Handle board updates
    socket.on('updateBoard', ({ row, col, symbol }) => {
        socket.to('queue').emit('boardUpdated', { row, col, symbol });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
