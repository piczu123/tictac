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
io.on('connection', (socket) => {
    console.log('A user connected');

    // Add your socket event listeners here

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
