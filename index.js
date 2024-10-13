const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let rooms = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('createRoom', (roomName) => {
        if (!rooms[roomName]) {
            rooms[roomName] = { board: Array(15).fill().map(() => Array(15).fill(null)), players: [], currentTurn: 'X' };
            socket.join(roomName);
            rooms[roomName].players.push(socket.id);
            io.to(roomName).emit('gameState', rooms[roomName]);
        }
    });

    socket.on('joinRoom', (roomName) => {
        if (rooms[roomName] && rooms[roomName].players.length < 2) {
            socket.join(roomName);
            rooms[roomName].players.push(socket.id);
            io.to(roomName).emit('gameState', rooms[roomName]);
        }
    });

    socket.on('makeMove', ({ roomName, x, y, playerSymbol }) => {
        const room = rooms[roomName];
        if (room && room.board[x][y] === null && room.currentTurn === playerSymbol) {
            room.board[x][y] = playerSymbol;
            room.currentTurn = playerSymbol === 'X' ? 'O' : 'X';
            room.lastMove = { x, y };
            io.to(roomName).emit('gameState', room);

            if (checkWin(room.board, x, y, playerSymbol)) {
                io.to(roomName).emit('gameOver', playerSymbol);
            }
        }
    });

    socket.on('disconnect', () => {
        for (let roomName in rooms) {
            rooms[roomName].players = rooms[roomName].players.filter(id => id !== socket.id);
            if (rooms[roomName].players.length === 0) {
                delete rooms[roomName];
            }
        }
        console.log('User disconnected:', socket.id);
    });
});

function checkWin(board, x, y, symbol) {
    // Win-checking logic (rows, columns, diagonals)
    return false;
}

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
