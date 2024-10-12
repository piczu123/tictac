const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let rooms = {};

// Bind to the port from the environment, or default to 3000 if not set
const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    let currentRoom; // Store the current room for each socket
    let playerName; // Store the player's name

    socket.on('createRoom', (roomName, name) => {
        if (!rooms[roomName]) {
            rooms[roomName] = { 
                players: [{ id: socket.id, name }], // Store the player in the room
                board: Array(15).fill(null).map(() => Array(15).fill(null)), 
                lastMove: null,
                turn: 'X' // First turn starts with 'X'
            };
            console.log(`Room created: ${roomName}`);
        }
        socket.join(roomName);
        currentRoom = roomName; // Set the current room for this socket
        playerName = name; // Store the player's name
        rooms[roomName].players[0] = { id: socket.id, name }; // Save player details
        socket.emit('roomCreated', roomName);
        if (rooms[roomName].players.length === 2) {
            const firstPlayerIndex = Math.floor(Math.random() * 2); // Randomly choose first player
            const firstPlayer = rooms[roomName].players[firstPlayerIndex];
            io.to(roomName).emit('startGame', firstPlayer); // Notify players who starts first
        }
    });

    socket.on('joinRoom', (roomName, name) => {
        if (rooms[roomName] && rooms[roomName].players.length < 2) {
            rooms[roomName].players.push({ id: socket.id, name });
            socket.join(roomName);
            currentRoom = roomName; // Set the current room for this socket
            playerName = name; // Store the player's name
            io.to(roomName).emit('playerJoined', name);
            socket.emit('roomJoined', roomName, rooms[roomName].players);
            if (rooms[roomName].players.length === 2) {
                const firstPlayerIndex = Math.floor(Math.random() * 2); // Randomly choose first player
                const firstPlayer = rooms[roomName].players[firstPlayerIndex];
                io.to(roomName).emit('startGame', firstPlayer); // Notify players who starts first
            }
        } else {
            socket.emit('roomFull', roomName);
        }
    });

    socket.on('makeMove', (x, y, playerSymbol) => {
        const room = rooms[currentRoom];
        if (room && room.board[x][y] === null && room.turn === playerSymbol) {
            room.board[x][y] = playerSymbol;
            room.lastMove = { x, y, playerSymbol };

            // Switch turn
            room.turn = playerSymbol === 'X' ? 'O' : 'X';

            io.to(currentRoom).emit('moveMade', room.board, room.lastMove);
            checkWin(currentRoom, x, y, playerSymbol);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (let room in rooms) {
            rooms[room].players = rooms[room].players.filter(player => player.id !== socket.id);
            if (rooms[room].players.length === 0) {
                delete rooms[room];
            }
        }
    });
});

const checkWin = (roomName, x, y, playerSymbol) => {
    const room = rooms[roomName];
    // Check logic for winning (horizontal, vertical, diagonal)
    const directions = [
        { x: 1, y: 0 },  // Horizontal
        { x: 0, y: 1 },  // Vertical
        { x: 1, y: 1 },  // Diagonal \
        { x: 1, y: -1 }  // Diagonal /
    ];
    for (let { x: dx, y: dy } of directions) {
        let count = 1;

        // Check in positive direction
        for (let step = 1; step < 5; step++) {
            const newX = x + step * dx;
            const newY = y + step * dy;
            if (room.board[newX]?.[newY] === playerSymbol) {
                count++;
            } else {
                break;
            }
        }

        // Check in negative direction
        for (let step = 1; step < 5; step++) {
            const newX = x - step * dx;
            const newY = y - step * dy;
            if (room.board[newX]?.[newY] === playerSymbol) {
                count++;
            } else {
                break;
            }
        }

        if (count >= 5) {
            io.to(roomName).emit('gameOver', playerSymbol);
            return;
        }
    }
};

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
