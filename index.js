const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

const rooms = {};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('createRoom', (roomName) => {
        if (!rooms[roomName]) {
            rooms[roomName] = {
                players: [],
                board: Array.from({ length: 15 }, () => Array(15).fill(null)),
                currentTurn: null,
                lastMove: null,
            };
            console.log('Room created:', roomName);
        }
        socket.join(roomName);
        rooms[roomName].players.push(socket.id);
        if (rooms[roomName].players.length === 1) {
            rooms[roomName].currentTurn = socket.id; // Set first player turn
        }
        io.to(socket.id).emit('gameState', rooms[roomName]);
    });

    socket.on('joinRoom', (roomName) => {
        if (rooms[roomName] && rooms[roomName].players.length < 2) {
            socket.join(roomName);
            rooms[roomName].players.push(socket.id);
            io.to(socket.id).emit('gameState', rooms[roomName]);
            io.to(roomName).emit('gameState', rooms[roomName]);
        } else {
            socket.emit('error', 'Room is full or does not exist.');
        }
    });

    socket.on('makeMove', ({ roomName, x, y, playerSymbol }) => {
        const room = rooms[roomName];
        if (room && room.board[x][y] === null && room.currentTurn === socket.id) {
            room.board[x][y] = playerSymbol; // Update board with player symbol
            room.lastMove = { x, y };
            room.currentTurn = room.players.find(p => p !== socket.id); // Switch turn
            io.to(roomName).emit('gameState', room);

            // Check for win after the move
            if (checkWin(room.board, x, y, playerSymbol)) {
                io.to(roomName).emit('gameOver', playerSymbol);
                // You can also send the winning cells here if needed
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (const roomName in rooms) {
            const room = rooms[roomName];
            room.players = room.players.filter(id => id !== socket.id);
            if (room.players.length === 0) {
                delete rooms[roomName]; // Remove empty rooms
            } else {
                io.to(roomName).emit('gameState', room);
            }
        }
    });
});

// Check win condition
function checkWin(board, x, y, playerSymbol) {
    const directions = [
        { x: 1, y: 0 }, // Horizontal
        { x: 0, y: 1 }, // Vertical
        { x: 1, y: 1 }, // Diagonal \
        { x: 1, y: -1 }, // Diagonal /
    ];

    for (const { x: dx, y: dy } of directions) {
        let count = 1;

        // Check one direction
        for (let step = 1; step < 5; step++) {
            const newX = x + dx * step;
            const newY = y + dy * step;
            if (newX >= 0 && newX < 15 && newY >= 0 && newY < 15 && board[newX][newY] === playerSymbol) {
                count++;
            } else {
                break;
            }
        }

        // Check the opposite direction
        for (let step = 1; step < 5; step++) {
            const newX = x - dx * step;
            const newY = y - dy * step;
            if (newX >= 0 && newX < 15 && newY >= 0 && newY < 15 && board[newX][newY] === playerSymbol) {
                count++;
            } else {
                break;
            }
        }

        if (count >= 5) {
            return true; // Win condition met
        }
    }
    return false; // No win
}

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
