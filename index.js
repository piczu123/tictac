const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public'));

let rooms = {};

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('createRoom', (roomName, playerName) => {
        if (!rooms[roomName]) {
            rooms[roomName] = { 
                players: [{ id: socket.id, name: playerName }], 
                board: Array(15).fill(null).map(() => Array(15).fill(null)), 
                lastMove: null 
            };
            console.log(`Room created: ${roomName}`);
        }
        socket.join(roomName);
        socket.emit('roomCreated', roomName);
    });

    socket.on('joinRoom', (roomName, playerName) => {
        if (rooms[roomName] && rooms[roomName].players.length < 2) {
            rooms[roomName].players.push({ id: socket.id, name: playerName });
            socket.join(roomName);
            io.to(roomName).emit('playerJoined', playerName);
            socket.emit('roomJoined', roomName, rooms[roomName].players);
            if (rooms[roomName].players.length === 2) {
                io.to(roomName).emit('startGame');
            }
        } else {
            socket.emit('roomFull', roomName);
        }
    });

    socket.on('makeMove', (roomName, x, y, playerSymbol) => {
        const room = rooms[roomName];
        if (room && room.board[x][y] === null) {
            room.board[x][y] = playerSymbol;
            room.lastMove = { x, y, playerSymbol };
            io.to(roomName).emit('moveMade', room.board, room.lastMove);
            checkWin(roomName, x, y, playerSymbol);
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
            break;
        }
    }
};

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
