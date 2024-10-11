const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = {}; // To keep track of the connected players and their symbols (X or O)
let boardState = Array(15 * 15).fill(null); // Initialize an empty 15x15 board
let currentPlayer = 'X'; // Start with player X

// Serve the static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// WebSocket connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Assign the player a symbol (X or O)
    let symbol = Object.keys(players).length === 0 ? 'X' : 'O';
    players[socket.id] = symbol;
    
    // Let the player know their symbol
    socket.emit('playerSymbol', symbol);

    // Broadcast the current board state and the current player's turn to all connected clients
    socket.emit('boardUpdate', boardState, currentPlayer);

    // Handle a player's move
    socket.on('makeMove', (index) => {
        if (players[socket.id] !== currentPlayer) {
            // Not this player's turn
            return;
        }

        // Ensure the selected cell is empty
        if (boardState[index] === null) {
            // Update the board state
            boardState[index] = currentPlayer;
            
            // Switch to the other player
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

            // Broadcast the updated board state to all players
            io.emit('boardUpdate', boardState, currentPlayer);
        }
    });

    // Handle player disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
        delete players[socket.id]; // Remove player from the list
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
