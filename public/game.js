const socket = io();
const gameBoard = document.getElementById('gameBoard');
const statusDiv = document.getElementById('status');

let board = Array(15).fill(null).map(() => Array(15).fill(null));
let currentPlayer = 'X'; // or 'O'
let isMyTurn = true; // Track if it's the current player's turn
let gameActive = true; // Track if the game is still active

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
    if (!isMyTurn || board[row][col] || !gameActive) return; // Check turn, if cell is occupied, and if game is active
    board[row][col] = currentPlayer;
    updateBoard();

    // Emit the move to the opponent
    socket.emit('makeMove', { row, col, player: currentPlayer });
    checkWinCondition(row, col); // Check for a win after the move
    isMyTurn = false; // End turn for current player
}

function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 15);
        const col = index % 15;
        cell.textContent = board[row][col] || '';
    });
}

// Check win condition after each move
function checkWinCondition(row, col) {
    // Check all directions for five in a row
    if (checkDirection(row, col, 1, 0) || // Horizontal
        checkDirection(row, col, 0, 1) || // Vertical
        checkDirection(row, col, 1, 1) || // Diagonal /
        checkDirection(row, col, 1, -1)) { // Diagonal \
        statusDiv.textContent = `${currentPlayer} wins!`;
        gameActive = false; // End game
    }
}

function checkDirection(row, col, rowDir, colDir) {
    let count = 1;

    // Check in the positive direction
    for (let i = 1; i < 5; i++) {
        const newRow = row + i * rowDir;
        const newCol = col + i * colDir;
        if (newRow < 0 || newRow >= 15 || newCol < 0 || newCol >= 15 || board[newRow][newCol] !== currentPlayer) break;
        count++;
    }

    // Check in the negative direction
    for (let i = 1; i < 5; i++) {
        const newRow = row - i * rowDir;
        const newCol = col - i * colDir;
        if (newRow < 0 || newRow >= 15 || newCol < 0 || newCol >= 15 || board[newRow][newCol] !== currentPlayer) break;
        count++;
    }

    return count >= 5; // Check if we have five in a row
}

socket.on('moveMade', (data) => {
    board[data.row][data.col] = data.player; // Update board with opponent's move
    updateBoard();
    isMyTurn = true; // Allow the current player to make a move again
});

// Initialize the game board
createBoard();

// Leave game button functionality
document.getElementById('leaveGameButton').addEventListener('click', () => {
    // Handle leaving the game (e.g., redirect to queue or home)
    window.location.href = '/queue.html';
});
