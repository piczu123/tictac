const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

let rooms = {}; // Store room data

io.on('connection', (socket) => {
    console.log('New client connected');

    // Handle room creation
    socket.on('createRoom', (roomName) => {
        if (!rooms[roomName]) {
            rooms[roomName] = {
                players: [],
                board: Array.from({ length: 15 }, () => Array(15).fill(null)),
                currentTurn: null,
                lastMove: null,
                gameOver: false,
            };
            socket.join(roomName);
            rooms[roomName].players.push(socket.id);
            socket.emit('gameState', rooms[roomName]);
            console.log(`Room ${roomName} created`);
        } else {
            socket.emit('error', 'Room already exists!');
        }
    });

    // Handle joining a room
    socket.on('joinRoom', (roomName) => {
        if (rooms[roomName] && rooms[roomName].players.length < 2) {
            socket.join(roomName);
            rooms[roomName].players.push(socket.id);
            if (rooms[roomName].players.length === 2) {
                rooms[roomName].currentTurn = rooms[roomName].players[0]; // Set first player to start
            }
            socket.emit('gameState', rooms[roomName]);
            socket.to(roomName).emit('gameState', rooms[roomName]);
            console.log(`Player joined room ${roomName}`);
        } else {
            socket.emit('error', 'Room does not exist or is full!');
        }
    });

    // Handle making a move
    socket.on('makeMove', ({ roomName, x, y, playerSymbol }) => {
        const room = rooms[roomName];
        if (room && !room.gameOver && room.currentTurn === socket.id) {
            if (!room.board[x][y]) { // Ensure the cell is empty
                room.board[x][y] = playerSymbol;
                room.lastMove = { x, y };
                room.currentTurn = room.players.find(player => player !== socket.id); // Switch turns
                checkWinCondition(room);
                io.to(roomName).emit('gameState', room); // Update all players
            }
        }
    });

    // Check for win conditions
    function checkWinCondition(room) {
        const winner = checkForWinner(room.board);
        if (winner) {
            room.gameOver = true;
            io.to(room.players[0]).emit('gameOver', winner);
            io.to(room.players[1]).emit('gameOver', winner);
        }
    }

    // Check for winner in the board
    function checkForWinner(board) {
        // Check rows, columns, and diagonals for a winner
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                if (board[i][j]) {
                    const playerSymbol = board[i][j];
                    
                    // Check horizontal
                    if (j <= 10 && checkDirection(board, i, j, 0, 1, playerSymbol)) {
                        return playerSymbol;
                    }
                    // Check vertical
                    if (i <= 10 && checkDirection(board, i, j, 1, 0, playerSymbol)) {
                        return playerSymbol;
                    }
                    // Check diagonal (top-left to bottom-right)
                    if (i <= 10 && j <= 10 && checkDirection(board, i, j, 1, 1, playerSymbol)) {
                        return playerSymbol;
                    }
                    // Check diagonal (bottom-left to top-right)
                    if (i >= 4 && j <= 10 && checkDirection(board, i, j, -1, 1, playerSymbol)) {
                        return playerSymbol;
                    }
                }
            }
        }
        return null; // No winner found
    }

    // Helper function to check in a given direction
    function checkDirection(board, startX, startY, stepX, stepY, playerSymbol) {
        let count = 0;
        for (let k = 0; k < 5; k++) {
            const x = startX + stepX * k;
            const y = startY + stepY * k;
            if (x < 0 || x >= 15 || y < 0 || y >= 15 || board[x][y] !== playerSymbol) {
                return false; // Break if out of bounds or not matching symbol
            }
            count++;
        }
        return count === 5; // Return true if we found 5 in a row
    }

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        // Cleanup: remove the room if it's empty
        for (const roomName in rooms) {
            rooms[roomName].players = rooms[roomName].players.filter(player => player !== socket.id);
            if (rooms[roomName].players.length === 0) {
                delete rooms[roomName];
                console.log(`Room ${roomName} deleted`);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
