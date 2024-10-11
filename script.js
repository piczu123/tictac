const socket = io();
const gameBoard = document.getElementById('game-board');

function createBoard() {
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = `${row},${col}`;
            cell.addEventListener('click', () => handleCellClick(row, col));
            gameBoard.appendChild(cell);
        }
    }
}

function handleCellClick(row, col) {
    socket.emit('makeMove', row, col);
}

socket.on('updateGameState', (gameState) => {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell) => {
        const [row, col] = cell.dataset.index.split(',').map(Number);
        cell.textContent = gameState[row][col] || '';
    });
});

// Initialize the board
createBoard();
