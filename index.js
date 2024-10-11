const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

let players = {};
let gameState = Array(15).fill().map(() => Array(15).fill(null)); // Empty 15x15 grid
let currentPlayer = 'X'; // Start with player X

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // Assign player X or O depending on whether they are the first or second to join
    if (!players.X) {
        players.X = socket.id;
        socket.emit('assignSymbol', 'X');
    } else if (!players.O) {
        players.O = socket.id;
        socket.emit('assignSymbol', 'O');
    } else {
        socket.emit('full'); // Notify if room is full
        socket.disconnect();
        return;
    }

    socket.on('makeMove', (data) => {
        if (socket.id === players[currentPlayer]) {
            const { row, col } = data;
            
            if (gameState[row][col] === null) {
                gameState[row][col] = currentPlayer;
                io.emit('updateBoard', { row, col, symbol: currentPlayer });
                
                // Switch player turn
                currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            }
        }
    });

    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);

        if (players.X === socket.id) {
            delete players.X;
        } else if (players.O === socket.id) {
            delete players.O;
        }

        if (!players.X && !players.O) {
            gameState = Array(15).fill().map(() => Array(15).fill(null)); // Reset game
            currentPlayer = 'X';
        }

        io.emit('playerDisconnected');
    });
});

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is running...');
});
