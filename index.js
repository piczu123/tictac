const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const rooms = {}; // Object to store room data

io.on('connection', (socket) => {
    let currentRoom = null;
    
    socket.on('createRoom', (roomName) => {
        if (!rooms[roomName]) {
            rooms[roomName] = { players: [], board: Array(15).fill(null).map(() => Array(15).fill(null)), turn: 'X' };
            currentRoom = roomName;
            socket.join(roomName);
            socket.emit('roomCreated', roomName);
        } else {
            socket.emit('roomExists');
        }
    });

    socket.on('joinRoom', (roomName, playerName) => {
        if (rooms[roomName] && rooms[roomName].players.length < 2) {
            rooms[roomName].players.push(playerName);
            currentRoom = roomName;
            socket.join(roomName);
            io.to(roomName).emit('playerJoined', playerName);
            socket.emit('roomJoined', roomName);
            io.to(roomName).emit('updateBoard', rooms[roomName].board);
        } else {
            socket.emit('roomNotFound');
        }
    });

    socket.on('makeMove', (row, col) => {
        if (currentRoom && rooms[currentRoom]) {
            const room = rooms[currentRoom];
            if (!room.board[row][col] && room.turn) {
                room.board[row][col] = room.turn;
                const winner = checkWinner(room.board, room.turn);

                if (winner) {
                    io.to(currentRoom).emit('gameOver', winner);
                    room.turn = null; // Game over
                } else {
                    room.turn = room.turn === 'X' ? 'O' : 'X'; // Switch turns
                    io.to(currentRoom).emit('updateBoard', room.board);
                    io.to(currentRoom).emit('turnChange', room.turn);
                }
            }
        }
    });

    socket.on('disconnect', () => {
        if (currentRoom) {
            const room = rooms[currentRoom];
            if (room) {
                room.players = room.players.filter((player) => player !== socket.id);
                if (room.players.length === 0) {
                    delete rooms[currentRoom]; // Remove empty room
                }
            }
        }
    });
});

function checkWinner(board, player) {
    // Check horizontal, vertical and diagonal
    for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 15; c++) {
            if (checkDirection(board, r, c, 1, 0, player) || // Horizontal
                checkDirection(board, r, c, 0, 1, player) || // Vertical
                checkDirection(board, r, c, 1, 1, player) || // Diagonal \
                checkDirection(board, r, c, 1, -1, player)) { // Diagonal /
                return player; // Winner found
            }
        }
    }
    return null; // No winner
}

function checkDirection(board, row, col, dRow, dCol, player) {
    let count = 0;
    for (let i = 0; i < 5; i++) {
        const r = row + i * dRow;
        const c = col + i * dCol;
        if (r < 0 || r >= 15 || c < 0 || c >= 15 || board[r][c] !== player) {
            return false;
        }
        count++;
    }
    return count === 5;
}

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
