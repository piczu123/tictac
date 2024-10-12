const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

let rooms = {}; // Object to hold room data

app.use(express.static('public')); // Serve static files from 'public' directory

io.on('connection', (socket) => {
    console.log('New client connected');

    // Join a room
    socket.on('joinRoom', ({ roomName, playerName }) => {
        socket.join(roomName);
        
        if (!rooms[roomName]) {
            rooms[roomName] = {
                players: [],
                board: Array(15).fill(null).map(() => Array(15).fill(null)),
                turn: 'X', // Player 1 starts with 'X'
                winner: null
            };
        }

        rooms[roomName].players.push(playerName);
        io.to(roomName).emit('updateGame', rooms[roomName]);
    });

    // Handle making a move
    socket.on('makeMove', ({ roomName, x, y }) => {
        const room = rooms[roomName];

        if (room.winner) return; // Ignore moves if there's already a winner
        if (room.board[x][y] === null) {
            room.board[x][y] = room.turn;
            room.turn = room.turn === 'X' ? 'O' : 'X'; // Switch turn
            
            if (checkWin(room.board, x, y)) {
                room.winner = room.board[x][y];
                io.to(roomName).emit('gameOver', room.winner);
            }

            io.to(roomName).emit('updateGame', room);
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Check for a win condition
function checkWin(board, x, y) {
    const symbol = board[x][y];
    return (
        checkDirection(board, symbol, x, y, 1, 0) || // Horizontal
        checkDirection(board, symbol, x, y, 0, 1) || // Vertical
        checkDirection(board, symbol, x, y, 1, 1) || // Diagonal /
        checkDirection(board, symbol, x, y, 1, -1)   // Diagonal \
    );
}

// Check in a specific direction for a win
function checkDirection(board, symbol, x, y, dx, dy) {
    let count = 0;
    for (let i = -4; i <= 4; i++) {
        const nx = x + i * dx;
        const ny = y + i * dy;

        if (nx >= 0 && ny >= 0 && nx < 15 && ny < 15 && board[nx][ny] === symbol) {
            count++;
            if (count === 5) return true; // Found 5 in a row
        } else {
            count = 0; // Reset count if broken
        }
    }
    return false;
}

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
