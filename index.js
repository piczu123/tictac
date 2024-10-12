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
                turn: null,
                isGameStarted: false
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
            io.to(currentRoom).emit('updatePlayerNames', players);

            if (players.length === 2) {
                const firstPlayer = Math.random() < 0.5 ? players[0] : players[1];
                rooms[roomName].turn = firstPlayer.id;
                rooms[roomName].isGameStarted = true;
                io.to(roomName).emit('startGame', { players, firstPlayer });
            } else {
                socket.emit('waitingForPlayer');
            }
        } else {
            socket.emit('roomFull', roomName);
        }
    });

    socket.on('makeMove', (x, y, playerSymbol) => {
        const room = rooms[currentRoom];
        if (room && room.turn === socket.id && room.board[x][y] === null && room.isGameStarted) {
            room.board[x][y] = playerSymbol;
            room.turn = room.players.find(player => player.id !== socket.id).id;
            io.to(currentRoom).emit('moveMade', room.board);
            checkWin(currentRoom, x, y, playerSymbol);
        }
    });

    socket.on('disconnect', () => {
        if (currentRoom && rooms[currentRoom]) {
            rooms[currentRoom].players = rooms[currentRoom].players.filter(player => player.id !== socket.id);
            if (rooms[currentRoom].players.length === 0) {
                delete rooms[currentRoom];
            } else {
                io.to(currentRoom).emit('playerLeft', playerName);
            }
        }
    });
});

const checkWin = (roomName, x, y, playerSymbol) => {
    const room = rooms[roomName];
    const directions = [
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 1, y: -1 }
    ];
    for (let { x: dx, y: dy } of directions) {
        let count = 1;

        for (let step = 1; step < 5; step++) {
            const newX = x + step * dx;
            const newY = y + step * dy;
            if (room.board[newX]?.[newY] === playerSymbol) {
                count++;
            } else {
                break;
            }
        }

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
