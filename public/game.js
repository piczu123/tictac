const socket = io();
const gameBoard = document.getElementById('gameBoard');
const statusDiv = document.getElementById('status');
const playerNamesDiv = document.getElementById('playerNames');

let board = Array(15).fill(null).map(() => Array(15).fill(null));
let currentPlayer;
let playerSymbol;
let opponentSymbol;

// Initialize the game board
createBoard();

// Display player names
socket.on('startGame', (data) => {
    currentPlayer = data.currentPlayer;
    playerSymbol = currentPlayer === 'X' ? 'X' : 'O';
    opponentSymbol = currentPlayer === 'X' ? 'O' : 'X';
    playerNamesDiv.textContent = `You: ${currentPlayer === 'X' ? 'X' : 'O'}, Opponent: ${data.opponent}`;
});

function createBoard() {
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.addEventListener('click', () => makeMove(row, col));
            gameBoard.appendChild(cell);
        }
    }
}

function makeMove(row, col) {
    if (board[row][col] || currentPlayer === null) return; // Check if cell is already occupied
    board[row][col] = playerSymbol; // Set the player's symbol
    updateBoard();

    // Emit the move to the opponent
    socket.emit('makeMove', { row, col, player: playerSymbol });

    if (checkWin(row, col, playerSymbol)) {
        statusDiv.textContent = `${playerSymbol} wins!`;
        currentPlayer = null; // Stop further moves
        return;
    }
    
    currentPlayer = opponentSymbol; // Switch player
}

function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 15);
        const col = index % 15;
        cell.textContent = board[row][col] || '';
    });
}

socket.on('moveMade', (data) => {
    board[data.row][data.col] = data.player; // Update board with opponent's move
    updateBoard();

    if (checkWin(data.row, data.col, data.player)) {
        statusDiv.textContent = `${data.player} wins!`;
        currentPlayer = null; // Stop further moves
    } else {
        currentPlayer = playerSymbol; // Switch back to the original player
    }
});

// Check for winning condition
function checkWin(row, col, player) {
    // Horizontal, Vertical, and Diagonal checks
    return (
        checkDirection(row, col, player, 0, 1) || // Horizontal
        checkDirection(row, col, player, 1, 0) || // Vertical
        checkDirection(row, col, player, 1, 1) || // Diagonal /
        checkDirection(row, col, player, 1, -1)   // Diagonal \
    );
}

function checkDirection(row, col, player, rowDir, colDir) {
    let count = 1;

    // Check one direction
    for (let i = 1; i < 5; i++) {
        const r = row + i * rowDir;
        const c = col + i * colDir;
        if (r < 0 || r >= 15 || c < 0 || c >= 15 || board[r][c] !== player) break;
        count++;
    }

    // Check the opposite direction
    for (let i = 1; i < 5; i++) {
        const r = row - i * rowDir;
        const c = col - i * colDir;
        if (r < 0 || r >= 15 || c < 0 || c >= 15 || board[r][c] !== player) break;
        count++;
    }

    return count >= 5; // Check if there are 5 in a row
}

// Leave game button functionality
document.getElementById('leaveGameButton').addEventListener('click', () => {
    // Handle leaving the game (e.g., redirect to queue or home)
    window.location.href = '/queue.html';
});
