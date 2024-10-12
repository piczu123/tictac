const socket = io();
const board = document.getElementById('board');
const joinButton = document.getElementById('join-button');
const roomNameInput = document.getElementById('room-name');
const playerNameInput = document.getElementById('player-name');
const status = document.getElementById('status');

let currentRoom;

function createBoard() {
    board.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = i;
            cell.dataset.y = j;
            cell.addEventListener('click', handleCellClick);
            row.appendChild(cell);
        }
        board.appendChild(row);
    }
}

function handleCellClick(event) {
    const x = event.target.dataset.x;
    const y = event.target.dataset.y;
    socket.emit('makeMove', { roomName: currentRoom, x: parseInt(x), y: parseInt(y) });
}

socket.on('updateGame', (data) => {
    currentRoom = data.roomName;
    createBoard();
    updateBoard(data.board);
});

socket.on('gameOver', (winner) => {
    status.textContent = `Player ${winner} wins!`;
    highlightWinningCells(); // Highlight winning cells if needed
});

function updateBoard(boardData) {
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.querySelector(`.cell[data-x='${i}'][data-y='${j}']`);
            cell.textContent = boardData[i][j];
        }
    }
}

function highlightWinningCells() {
    // You can enhance this function to highlight winning cells when a player wins
}

// Join room event
joinButton.addEventListener('click', () => {
    const roomName = roomNameInput.value;
    const playerName = playerNameInput.value;
    socket.emit('joinRoom', { roomName, playerName });
});
