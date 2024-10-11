const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { v4: uuidv4 } = require('uuid'); // Use to create unique game room links

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static('public'));

// Store active game rooms and player data
const gameRooms = {};

io.on('connection', (socket) => {
    console.log('A player connected:', socket.id);

    // When a player joins a room
    socket.on('joinRoom', ({ roomId, playerName }) => {
        if (!gameRooms[roomId]) {
            gameRooms[roomId] = {
                players: {},
                gameState: Array(15).fill().map(() => Array(15).fill(null)), // 15x15 grid
                currentPlayer: 'X',
            };
        }

        const room = gameRooms[roomId];

        // Assign player X or O depending on whether they are the first or second to join
        if (!room.players.X) {
            room.players.X = { id: socket.id, name: playerName };
            socket.emit('assignSymbol', 'X');
        } else if (!room.players.O) {
            room.players.O = { id: socket.id, name: playerName };
            socket.emit('assignSymbol', 'O');
        } else {
            socket.emit('full'); // Notify if room is full
            socket.disconnect();
            return;
        }

        socket.join(roomId); // Join the socket.io room for the game

        // Broadcast to both players that the game is ready if both have joined
        if (room.players.X && room.players.O) {
            io.to(roomId).emit('gameReady', {
                playerX: room.players.X.name,
                playerO: room.players.O.name
            });
        }

        // Handle a player's move
        socket.on('makeMove', ({ row, col }) => {
            if (socket.id === room.players[room.currentPlayer].id && room.gameState[row][col] === null) {
                room.gameState[row][col] = room.currentPlayer;
                io.to(roomId).emit('updateBoard', { row, col, symbol: room.currentPlayer });
                
                // Switch player turn
                room.currentPlayer = room.currentPlayer === 'X' ? 'O' : 'X';
            }
        });

        // Handle player disconnect
        socket.on('disconnect', () => {
            console.log('Player disconnected:', socket.id);

            if (room.players.X && room.players.X.id === socket.id) {
                delete room.players.X;
            } else if (room.players.O && room.players.O.id === socket.id) {
                delete room.players.O;
            }

            io.to(roomId).emit('playerDisconnected');
        });
    });
});

// Route to generate a new game link
app.get('/new', (req, res) => {
    const roomId = uuidv4();
    res.redirect(`/${roomId}`);
});

// Catch-all route for rooms
app.get('/:roomId', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});

server.listen(process.env.PORT || 3000, () => {
    console.log('Server is running...');
});
