const socket = io();
const gameBoard = document.getElementById('gameBoard');
const status = document.getElementById('status');
const restartGameButton = document.getElementById('restartGame');
const boardSize = 15; // Change this to 15x15 grid
let currentPlayer = 'X';
let board = Array.from(Array(boardSize), () => Array(boardSize).fill(null));

// Create game board
function createBoard() {
    gameBoard.innerHTML = '';
    for (let i = 0; i < boardSize; i++) {
        const row = document.createElement('div');
        row.classList.add('board-row');
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement('div');
            cell.classList.add('board-cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', () => makeMove(i, j));
            row.appendChild(cell);
        }
        gameBoard.appendChild(row);
    }
}

// Handle player moves
function makeMove(row, col) {
    if (!board[row][col] && !status.textContent) {
        board[row][col] = currentPlayer;
        socket.emit('makeMove', { row, col, player: currentPlayer });
        updateBoard();
        checkWin();
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X'; // Switch players
    }
}

// Update board on client
function updateBoard() {
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = gameBoard.querySelector(`[data-row='${i}'][data-col='${j}']`);
            if (board[i][j]) {
                cell.textContent = board[i][j];
            }
        }
    }
}

// Check for a winner
function checkWin() {
    // Simple check for a winning condition (5 in a row)
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j]) {
                if (checkDirection(i, j, 1, 0) || // Horizontal
                    checkDirection(i, j, 0, 1) || // Vertical
                    checkDirection(i, j, 1, 1) || // Diagonal /
                    checkDirection(i, j, 1, -1)) { // Diagonal \
                    status.textContent = `${board[i][j]} wins!`;
                    return;
                }
            }
        }
    }
}

// Check in a specified direction
function checkDirection(row, col, rowInc, colInc) {
    let count = 0;
    for (let k = 0; k < 5; k++) {
        const r = row + k * rowInc;
        const c = col + k * colInc;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === currentPlayer) {
            count++;
        } else {
            break;
        }
    }
    return count === 5;
}

// Restart game
restartGameButton.addEventListener('click', () => {
    board = Array.from(Array(boardSize), () => Array(boardSize).fill(null));
    currentPlayer = 'X';
    status.textContent = '';
    createBoard();
});

// Socket events
socket.on('moveMade', (data) => {
    board[data.row][data.col] = data.player;
    updateBoard();
    checkWin();
});

// Initialize game
createBoard();
