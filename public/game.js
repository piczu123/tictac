const socket = io();
const gameBoard = document.getElementById('gameBoard');
const statusDiv = document.getElementById('status');

let board = Array(15).fill(null).map(() => Array(15).fill(null));
let currentPlayer = 'X'; // or 'O'

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
    if (board[row][col] || !currentPlayer) return; // Check if cell is already occupied
    board[row][col] = currentPlayer;
    updateBoard();
    
    // Emit the move to the opponent
    socket.emit('makeMove', { row, col, player: currentPlayer });
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Switch player
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
});

// Initialize the game board
createBoard();

// Leave game button functionality
document.getElementById('leaveGameButton').addEventListener('click', () => {
    // Handle leaving the game (e.g., redirect to queue or home)
    window.location.href = '/queue.html';
});
