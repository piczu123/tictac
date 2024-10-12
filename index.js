const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;

let rooms = {};

app.use(express.static('public'));

const checkWin = (board, x, y, playerSymbol) => {
    // Check all possible win directions
    const directions = [
        [[0, 1], [0, -1]], // Horizontal
        [[1, 0], [-1, 0]], // Vertical
        [[1, 1], [-1, -1]], // Diagonal \
        [[1, -1], [-1, 1]]  // Diagonal /
    ];
    
    for (const direction of directions) {
        let count = 1;

        for (const [dx, dy] of direction) {
            let nx = x + dx;
            let ny = y + dy;

            while (nx >= 0 && ny >= 0 && nx < 15 && ny < 15 && board[nx][ny] === playerSymbol) {
                count++;
                nx += dx;
                ny += dy;
            }
        }

        if (count >= 5) return true;
    }

    return false;
};

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('createRoom', (roomName) => {
        rooms[roomName] = {
            players: [socket.id],
            board: Array(15).fill(null).map(() => Array(15).fill(null)),
            currentTurn: 'X',
            lastMove: null,
        };
        socket.join(roomName);
        console.log(`Room created: ${roomName}`);
        socket.emit('gameState', rooms[roomName]);
    });

    socket.on('joinRoom', (roomName) => {
        if (rooms[roomName] && rooms[roomName].players.length < 2) {
            rooms[roomName].players.push(socket.id);
            socket.join(roomName);
            console.log(`Player joined room: ${roomName}`);
            io.to(roomName).emit('gameState', rooms[roomName]);
        } else {
            socket.emit('error', 'Room does not exist or is full');
        }
    });

    socket.on('makeMove', ({ roomName, x, y, playerSymbol }) => {
        const room = rooms[roomName];
        if (room && room.board[x][y] === null && room.currentTurn === playerSymbol) {
            room.board[x][y] = playerSymbol;
            room.lastMove = { x, y, playerSymbol }; // Save the last move
            room.currentTurn = playerSymbol === 'X' ? 'O' : 'X'; // Swap turns
            
            // Check for a win
            if (checkWin(room.board, x, y, playerSymbol)) {
                io.to(roomName).emit('gameOver', playerSymbol);
            } else {
                io.to(roomName).emit('gameState', room);
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
        // Handle player disconnect logic if needed
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
