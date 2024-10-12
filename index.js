const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let games = {};

app.use(express.static(__dirname + '/public'));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinRoom', (room) => {
        socket.join(room);
        console.log(`User ${socket.id} joined room: ${room}`);

        if (!games[room]) {
            games[room] = Array(15).fill(null).map(() => Array(15).fill(''));
        }

        io.to(room).emit('syncGameState', games[room]);
    });

    socket.on('makeMove', ({ room, row, col, symbol }) => {
        if (games[room] && games[room][row][col] === '') {
            games[room][row][col] = symbol;
            io.to(room).emit('syncGameState', games[room]);
        }
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
