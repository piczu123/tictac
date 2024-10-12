const socket = io();

const playerNameInput = document.getElementById('player-name');
const submitNameButton = document.getElementById('submit-name');
const createRoomButton = document.getElementById('create-room');
const joinRoomButton = document.getElementById('join-room');
const roomNameInput = document.getElementById('room-name');
const gameDiv = document.getElementById('game');
const boardDiv = document.getElementById('board');
const statusDiv = document.getElementById('status');
const roomControlsDiv = document.getElementById('room-controls');
const namePromptDiv = document.getElementById('name-prompt');
const playerNamesDiv = document.createElement('div'); // Display player names

let currentRoom;
let playerSymbol;
let playerName;

gameDiv.insertBefore(playerNamesDiv, boardDiv); // Add player names above the board

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
    roomControlsDiv.style.display = 'none';
    gameDiv.style.display = 'block';
    initializeBoard();
    statusDiv.innerText = 'Waiting for another player to join...';
});

socket.on('roomExists', () => {
    alert('Room name already exists. Please choose another name.');
});

socket.on('roomFull', () => {
    alert('This room is already full.');
});

socket.on('startGame', ({ players, firstPlayer }) => {
    gameDiv.style.display = 'block';
    playerNamesDiv.innerText = `${players[0].name} (X) vs ${players[1].name} (O)`;
    statusDiv.innerText = `${firstPlayer.name} goes first!`;
    playerSymbol = firstPlayer.id === socket.id ? 'X' : 'O';
});

socket.on('moveMade', (board) => {
    updateBoard(board);
});

socket.on('updatePlayerNames', (players) => {
    playerNamesDiv.innerText = `${players[0].name} (X) vs ${players[1]?.name || 'Waiting...'} (O)`;
});

socket.on('waitingForPlayer', () => {
    statusDiv.innerText = 'Waiting for another player to join...';
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
    if (playerSymbol) {
        socket.emit('makeMove', x, y, playerSymbol);
    }
}

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
