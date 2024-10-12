const socket = io();

const playerNameInput = document.getElementById('player-name');
const submitNameButton = document.getElementById('submit-name');
const createRoomButton = document.getElementById('create-room');
const joinRoomButton = document.getElementById('join-room');
const roomNameInput = document.getElementById('room-name');
const gameDiv = document.getElementById('game');
const boardDiv = document.getElementById('board');
const statusDiv = document.getElementById('status');
const playerNamesDiv = document.getElementById('player-names');
const roomControlsDiv = document.getElementById('room-controls');
const namePromptDiv = document.getElementById('name-prompt');

let currentRoom;
let playerSymbol;
let playerName;

submitNameButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (playerName) {
        namePromptDiv.style.display = 'none';
        roomControlsDiv.style.display = 'block';
    }
});

createRoomButton.addEventListener('click', () => {
    const roomName = roomNameInput.value.trim();
    if (roomName && playerName) {
        socket.emit('createRoom', roomName, playerName);
        currentRoom = roomName;
    }
});

joinRoomButton.addEventListener('click', () => {
    const roomName = roomNameInput.value.trim();
    if (roomName && playerName) {
        socket.emit('joinRoom', roomName, playerName);
        currentRoom = roomName;
    }
});

socket.on('roomCreated', (roomName) => {
    alert(`Room ${roomName} created! Waiting for another player to join...`);
    gameDiv.style.display = 'block';
    initializeBoard();
});

socket.on('roomJoined', (roomName, players) => {
    alert(`Joined room ${roomName}`);
    gameDiv.style.display = 'block';
    initializeBoard();
});

socket.on('playerJoined', (name) => {
    statusDiv.innerText = `${name} joined the game!`;
});

socket.on('startGame', ({ players, firstPlayer }) => {
    const [playerX, playerO] = firstPlayer.symbol === 'X' ? players : players.reverse();
    playerNamesDiv.innerText = `Players: ${playerX.name} (X) vs ${playerO.name} (O)`;
    playerSymbol = firstPlayer.symbol;
    statusDiv.innerText = `Game started! ${firstPlayer.symbol} goes first.`;
    initializeBoard();
});

function initializeBoard() {
    boardDiv.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = i;
            cell.dataset.y = j;
            cell.addEventListener('click', () => makeMove(i, j));
            boardDiv.appendChild(cell);
        }
    }
}

function makeMove(x, y) {
    if (playerSymbol) {
        socket.emit('makeMove', x, y, playerSymbol);
    }
}

socket.on('moveMade', (board) => {
    updateBoard(board);
});

function updateBoard(board) {
    const cells = boardDiv.getElementsByClassName('cell');
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = cells[i * 15 + j];
            cell.innerText = board[i][j] || '';
        }
    }
}

socket.on('gameOver', (winnerSymbol) => {
    statusDiv.innerText = `${winnerSymbol} wins!`;
    boardDiv.style.pointerEvents = 'none';
});
