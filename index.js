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
    let currentRoom;
    let playerName;

    socket.on('createRoom', (roomName, name) => {
        if (!rooms[roomName]) {
            rooms[roomName] = {
                players: [{ id: socket.id, name }],
                board: Array(15).fill(null).map(() => Array(15).fill(null)),
                lastMove: null,
                turn: null
            };
            socket.join(roomName);
            currentRoom = roomName;
            playerName = name;
            socket.emit('roomCreated', roomName);
        } else {
            socket.emit('roomExists', roomName);
        }
    });

    socket.on('joinRoom', (roomName, name) => {
        if (rooms[roomName] && rooms[roomName].players.length < 2) {
            rooms[roomName].players.push({ id: socket.id, name });
            socket.join(roomName);
            currentRoom = roomName;
            playerName = name;

            const players = rooms[roomName].players;
            const firstPlayer = Math.random() < 0.5 ? players[0] : players[1];
            rooms[roomName].turn = firstPlayer.id;
            io.to(roomName).emit('startGame', { players, firstPlayer });

        } else {
            socket.emit('roomFull', roomName);
        }
    });

    socket.on('makeMove', (x, y, playerSymbol) => {
        const room = rooms[currentRoom];
        if (room && room.turn === socket.id && room.board[x][y] === null) {
            room.board[x][y] = playerSymbol;
            room.turn = room.players.find(player => player.id !== socket.id).id;
            io.to(currentRoom).emit('moveMade', room.board);
        }
    });

    socket.on('disconnect', () => {
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom].players = rooms[currentRoom].players.filter(player => player.id !== socket.id);
            if (rooms[currentRoom].players.length === 0) {
                delete rooms[currentRoom];
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
