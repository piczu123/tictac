const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const rooms = {}; // Store room data

// Serve static files from the public directory
app.use(express.static("public"));

// Handle socket connections
io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", ({ roomName, playerName }) => {
        socket.join(roomName);

        // Initialize the room if it doesn't exist
        if (!rooms[roomName]) {
            rooms[roomName] = {
                players: [],
                board: Array(15).fill(null).map(() => Array(15).fill(null)),
                currentPlayer: null,
                winner: null
            };
        }

        const room = rooms[roomName];
        room.players.push(playerName);
        
        // Set the first player as the current player
        if (room.players.length === 1) {
            room.currentPlayer = playerName;
        }

        // Notify other players about the new player
        socket.to(roomName).emit("playerJoined", playerName);
        
        // Emit current room state to the new player
        socket.emit("roomData", { players: room.players, board: room.board });
    });

    socket.on("makeMove", ({ roomName, x, y }) => {
        const room = rooms[roomName];
        if (!room) return; // Room must exist
        if (room.winner) return; // Ignore moves if there's already a winner

        // Proceed with handling the move
        if (room.board[x][y] === null) { // Check if the cell is empty
            room.board[x][y] = room.currentPlayer; // Mark the cell with the current player's symbol
            
            // Check for a winner after the move
            const winner = checkWinner(room.board);
            if (winner) {
                room.winner = winner; // Set the winner
                io.to(roomName).emit("gameOver", { winner }); // Notify players about the winner
            } else {
                // Switch players
                room.currentPlayer = room.players[(room.players.indexOf(room.currentPlayer) + 1) % room.players.length];
            }

            // Update the board for all players
            io.to(roomName).emit("updateBoard", { board: room.board });
        }
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
        // Handle player disconnect logic if necessary
    });
});

// Function to check for a winner
function checkWinner(board) {
    // Check for horizontal, vertical, and diagonal wins
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const player = board[i][j];
            if (player) {
                // Check horizontal
                if (j + 4 < 15 && 
                    player === board[i][j + 1] && 
                    player === board[i][j + 2] && 
                    player === board[i][j + 3] && 
                    player === board[i][j + 4]) {
                    return player;
                }
                // Check vertical
                if (i + 4 < 15 && 
                    player === board[i + 1][j] && 
                    player === board[i + 2][j] && 
                    player === board[i + 3][j] && 
                    player === board[i + 4][j]) {
                    return player;
                }
                // Check diagonal (down-right)
                if (i + 4 < 15 && j + 4 < 15 && 
                    player === board[i + 1][j + 1] && 
                    player === board[i + 2][j + 2] && 
                    player === board[i + 3][j + 3] && 
                    player === board[i + 4][j + 4]) {
                    return player;
                }
                // Check diagonal (down-left)
                if (i + 4 < 15 && j - 4 >= 0 && 
                    player === board[i + 1][j - 1] && 
                    player === board[i + 2][j - 2] && 
                    player === board[i + 3][j - 3] && 
                    player === board[i + 4][j - 4]) {
                    return player;
                }
            }
        }
    }
    return null; // No winner
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
