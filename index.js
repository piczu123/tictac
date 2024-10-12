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
        // Implement win checking logic here (similar to previous)
        const winner = checkForWinner(room.board); // Placeholder function
        if (winner) {
            room.gameOver = true;
            io.to(room.players[0]).emit('gameOver', winner);
            io.to(room.players[1]).emit('gameOver', winner);
        }
    }

    // Placeholder function to check for winner
    function checkForWinner(board) {
        // Implement your winning logic here
        return null; // Change to return winner if found
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
