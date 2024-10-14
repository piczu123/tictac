const boardSize = 15;
const board = document.getElementById('board');
const statusDisplay = document.getElementById('status');
let currentPlayer = 'X'; 
let gameBoard = Array.from({ length: boardSize }, () => Array(boardSize).fill(''));

function createBoard() {
    for (let i = 0; i < boardSize; i++) {
        const row = document.createElement('div');
        row.classList.add('row');
        for (let j = 0; j < boardSize; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
}

function handleCellClick(event) {
    const row = event.target.dataset.row;
    const col = event.target.dataset.col;

    if (gameBoard[row][col] === '') {
        gameBoard[row][col] = currentPlayer;
        event.target.textContent = currentPlayer;
        checkWin();
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
}

function checkWin() {
    // Implement win checking logic here
    statusDisplay.textContent = `${currentPlayer} wins!`; // Placeholder message
}

createBoard();
