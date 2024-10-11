const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

let rooms = {}; // Store game rooms and their states

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('createRoom', (roomName) => {
        if (rooms[roomName]) {
            socket.emit('roomExists');
            return;
        }
        rooms[roomName] = {
            board: Array.from({ length: 15 }, () => Array(15).fill(null)),
            currentTurn: 'X',
            players: {},
        };
        socket.join(roomName);
        rooms[roomName].players[socket.id] = 'X'; // Assign player X
        socket.emit('roomCreated', roomName, `https://your-app-name.herokuapp.com/?room=${roomName}`); // Send the invite link
    });

    socket.on('joinRoom', (roomName) => {
        if (rooms[roomName] && Object.keys(rooms[roomName].players).length < 2) {
            socket.join(roomName);
            rooms[roomName].players[socket.id] = 'O'; // Assign player O
            io.to(roomName).emit('playerJoined', rooms[roomName].players);
            socket.emit('gameState', rooms[roomName]);
            io.to(roomName).emit('updateTurn', rooms[roomName].currentTurn);
        } else if (rooms[roomName]) {
            socket.emit('roomFull');
        } else {
            socket.emit('roomNotFound');
        }
    });

    socket.on('makeMove', ({ roomName, x, y }) => {
        const room = rooms[roomName];
        if (room && room.board[x][y] === null && room.players[socket.id] === room.currentTurn) {
            room.board[x][y] = room.currentTurn;
            const winner = checkWinner(room.board, x, y);
            room.currentTurn = room.currentTurn === 'X' ? 'O' : 'X';
            io.to(roomName).emit('updateBoard', room.board);
            io.to(roomName).emit('updateTurn', room.currentTurn);
            if (winner) {
                io.to(roomName).emit('gameOver', winner);
                delete rooms[roomName]; // Optional: remove room after game over
            }
        }
    });

    function checkWinner(board, x, y) {
        const player = board[x][y];
        const directions = [
            { dx: 1, dy: 0 }, // horizontal
            { dx: 0, dy: 1 }, // vertical
            { dx: 1, dy: 1 }, // diagonal \
            { dx: 1, dy: -1 } // diagonal /
        ];

        for (const { dx, dy } of directions) {
            let count = 1;

            // Check in the positive direction
            for (let step = 1; step < 5; step++) {
                const nx = x + step * dx;
                const ny = y + step * dy;
                if (nx < 0 || ny < 0 || nx >= 15 || ny >= 15 || board[nx][ny] !== player) break;
                count++;
            }

            // Check in the negative direction
            for (let step = 1; step < 5; step++) {
                const nx = x - step * dx;
                const ny = y - step * dy;
                if (nx < 0 || ny < 0 || nx >= 15 || ny >= 15 || board[nx][ny] !== player) break;
                count++;
            }

            // Check for a winner
            if (count >= 5) return player;
        }
        return null;
    }

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        // Handle player disconnection logic here
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
