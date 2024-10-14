const socket = io();

const board = Array(15).fill(null).map(() => Array(15).fill(null));

function createBoard() {
    const gameBoard = document.getElementById('game-board');
    gameBoard.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.addEventListener('click', () => handleCellClick(i, j));
            gameBoard.appendChild(cell);
        }
    }
}

function handleCellClick(i, j) {
    if (!board[i][j]) {
        board[i][j] = 'X'; // Replace with actual player's symbol
        socket.emit('makeMove', { x: i, y: j });
        renderBoard();
    }
}

function renderBoard() {
    const gameBoard = document.getElementById('game-board').children;
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            gameBoard[i * 15 + j].innerText = board[i][j] || '';
        }
    }
}

socket.on('moveMade', (data) => {
    board[data.x][data.y] = 'O'; // Replace with the opponent's symbol
    renderBoard();
});

createBoard();
