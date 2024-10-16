const socket = io();
const gameBoard = document.getElementById('gameBoard');
const statusDiv = document.getElementById('status');

let board = Array(15).fill(null).map(() => Array(15).fill(null));
let currentPlayer = sessionStorage.getItem('symbol'); // Get assigned symbol
let opponentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Set opponent's symbol
let isMyTurn = true; // Track whose turn it is
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
    board[row][col] = currentPlayer; // Use the assigned symbol
    updateBoard();

    // Emit the move to the opponent
    socket.emit('makeMove', { row, col, player: currentPlayer });
    checkWinCondition(row, col); // Check for a win after the move
    isMyTurn = false; // End turn for current player
}

// Check for win condition after a move
function checkWinCondition(row, col) {
    // Check horizontal, vertical, and diagonal lines for a win
    // Implement win-checking logic here and set gameActive to false if someone wins
}

function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 15);
        const col = index % 15;
        cell.textContent = board[row][col] || '';
    });
}

// When updating the board with opponent's move
socket.on('moveMade', (data) => {
    board[data.row][data.col] = opponentPlayer; // Use the opponent's symbol
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
