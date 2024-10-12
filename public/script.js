const socket = io();

let currentPlayerSymbol = 'X';
let room = null;

document.getElementById('joinRoomBtn').addEventListener('click', () => {
    room = document.getElementById('roomInput').value;
    if (room) {
        socket.emit('joinRoom', room);
        document.getElementById('messageDisplay').textContent = `Joined room: ${room}`;
        initializeBoard();
    }
});

socket.on('syncGameState', (gameState) => {
    updateBoard(gameState);
});

function initializeBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', () => makeMove(i, j));
            gameBoard.appendChild(cell);
        }
    }
}

function makeMove(row, col) {
    if (room) {
        socket.emit('makeMove', { room, row, col, symbol: currentPlayerSymbol });
    }
}

function updateBoard(gameState) {
    const gameBoard = document.getElementById('gameBoard');
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = gameBoard.children[i * 15 + j];
            cell.textContent = gameState[i][j];
        }
    }
}
