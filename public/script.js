const socket = io();

const createRoomBtn = document.getElementById('createRoomBtn');
const joinRoomBtn = document.getElementById('joinRoomBtn');
const roomNameInput = document.getElementById('roomName');
const playerNameInput = document.getElementById('playerName');
const gameContainer = document.getElementById('gameContainer');
const currentRoomSpan = document.getElementById('currentRoom');
const currentTurnSpan = document.getElementById('currentTurn');
const boardDiv = document.getElementById('board');

createRoomBtn.addEventListener('click', () => {
    const roomName = roomNameInput.value;
    const playerName = playerNameInput.value;
    if (roomName && playerName) {
        socket.emit('createRoom', roomName);
        socket.emit('joinRoom', roomName, playerName);
    }
});

joinRoomBtn.addEventListener('click', () => {
    const roomName = roomNameInput.value;
    const playerName = playerNameInput.value;
    if (roomName && playerName) {
        socket.emit('joinRoom', roomName, playerName);
    }
});

socket.on('roomCreated', (roomName) => {
    currentRoomSpan.textContent = roomName;
    gameContainer.classList.remove('hidden');
});

socket.on('roomExists', () => {
    alert('Room already exists. Please choose a different room name.');
});

socket.on('roomJoined', (roomName) => {
    currentRoomSpan.textContent = roomName;
    gameContainer.classList.remove('hidden');
    initializeBoard();
});

socket.on('playerJoined', (playerName) => {
    alert(`${playerName} has joined the room!`);
});

socket.on('updateBoard', (board) => {
    renderBoard(board);
});

socket.on('turnChange', (turn) => {
    currentTurnSpan.textContent = turn;
});

socket.on('gameOver', (winner) => {
    alert(`Game Over! Player ${winner} wins!`);
});

function initializeBoard() {
    boardDiv.innerHTML = '';
    for (let row = 0; row < 15; row++) {
        for (let col = 0; col < 15; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => {
                socket.emit('makeMove', row, col);
            });
            boardDiv.appendChild(cell);
        }
    }
}

function renderBoard(board) {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell) => {
        const row = cell.dataset.row;
        const col = cell.dataset.col;
        cell.textContent = board[row][col] ? board[row][col] : '';
        cell.className = `cell ${board[row][col]}`;
    });
}
