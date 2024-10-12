const socket = io();

const playerNameInput = document.getElementById('player-name');
const setNameButton = document.getElementById('set-name');
const createRoomButton = document.getElementById('create-room');
const joinRoomButton = document.getElementById('join-room');
const roomNameInput = document.getElementById('room-name');
const gameDiv = document.getElementById('game');
const boardDiv = document.getElementById('board');
const statusDiv = document.getElementById('status');
const roomControlsDiv = document.getElementById('room-controls');
const playerNamePromptDiv = document.getElementById('player-name-prompt');

let currentRoom;
let playerSymbol;
let playerName;

setNameButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (playerName) {
        playerNamePromptDiv.style.display = 'none'; // Hide name prompt
        roomControlsDiv.style.display = 'block'; // Show room controls
    }
});

createRoomButton.addEventListener('click', () => {
    const roomName = roomNameInput.value.trim();
    if (roomName && playerName) {
        socket.emit('createRoom', roomName, playerName);
        currentRoom = roomName;
        playerSymbol = 'X'; // First player is always 'X'
        roomControlsDiv.style.display = 'none'; // Hide room controls
    }
});

joinRoomButton.addEventListener('click', () => {
    const roomName = roomNameInput.value.trim();
    if (roomName && playerName) {
        socket.emit('joinRoom', roomName, playerName);
        currentRoom = roomName;
        playerSymbol = 'O'; // Second player is always 'O'
        roomControlsDiv.style.display = 'none'; // Hide room controls
    }
});

socket.on('roomCreated', (roomName) => {
    alert(`Room ${roomName} created! You are ${playerSymbol}.`);
    gameDiv.style.display = 'block'; // Show game board
    initializeBoard();
});

socket.on('roomJoined', (roomName, players) => {
    alert(`Joined room ${roomName} as ${playerSymbol}.`);
    gameDiv.style.display = 'block'; // Show game board
    initializeBoard();
});

socket.on('playerJoined', (playerName) => {
    statusDiv.innerText = `${playerName} joined the game!`;
});

socket.on('startGame', () => {
    statusDiv.innerText = 'Game started!';
});

function initializeBoard() {
    boardDiv.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.dataset.x = i;
            cell.dataset.y = j;
            cell.addEventListener('click', () => makeMove(i, j));
            boardDiv.appendChild(cell);
        }
    }
}

function makeMove(x, y) {
    socket.emit('makeMove', currentRoom, x, y, playerSymbol);
}

socket.on('moveMade', (board, lastMove) => {
    updateBoard(board);
    if (lastMove) {
        statusDiv.innerText = `Last move: ${lastMove.playerSymbol} at (${lastMove.x}, ${lastMove.y})`;
    }
});

function updateBoard(board) {
    const cells = boardDiv.children;
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = cells[i * 15 + j];
            cell.innerText = board[i][j] ? board[i][j] : '';
        }
    }
}

socket.on('gameOver', (winnerSymbol) => {
    statusDiv.innerText = `${winnerSymbol} wins!`;
    boardDiv.style.pointerEvents = 'none';
});
