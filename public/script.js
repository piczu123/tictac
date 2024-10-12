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

// Prompt for player's name
submitNameButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (playerName) {
        namePromptDiv.style.display = 'none';
        roomControlsDiv.style.display = 'block';
    }
});

// Create room button action
createRoomButton.addEventListener('click', () => {
    const roomName = roomNameInput.value.trim();
    if (roomName && playerName) {
        socket.emit('createRoom', roomName, playerName);
        currentRoom = roomName;
    }
});

// Join room button action
joinRoomButton.addEventListener('click', () => {
    const roomName = roomNameInput.value.trim();
    if (roomName && playerName) {
        socket.emit('joinRoom', roomName, playerName);
        currentRoom = roomName;
    }
});

// Handle events from the server
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

socket.on('playerJoined', (playerName) => {
    statusDiv.innerText = `${playerName} joined the game!`;
});

socket.on('startGame', ({ firstPlayer, turn }) => {
    statusDiv.innerText = `${firstPlayer.name} starts as ${turn}. Game started!`;
    playerSymbol = turn;
    boardDiv.style.pointerEvents = turn === playerSymbol ? 'auto' : 'none'; // Enable moves for the starting player
    playerNamesDiv.innerText = `Players: ${firstPlayer.name} (${turn}) vs ${turn === 'X' ? 'O' : 'X'}`;
});

// Update the board when a move is made
socket.on('moveMade', (board, lastMove) => {
    updateBoard(board);
    if (lastMove) {
        statusDiv.innerText = `Last move: ${lastMove.playerSymbol} at (${lastMove.x}, ${lastMove.y})`;
    }
});

// Handle game over
socket.on('gameOver', (winnerSymbol) => {
    statusDiv.innerText = `${winnerSymbol} wins!`;
    boardDiv.style.pointerEvents = 'none'; // Disable further moves
    socket.emit('endGame'); // Notify server that the game has ended
});

// Initialize game board
function initializeBoard() {
    boardDiv.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.dataset.x = i;
            cell.dataset.y = j;
            cell.addEventListener('click', () => makeMove(i, j));
            cell.classList.add('cell');
            boardDiv.appendChild(cell);
        }
    }
}

// Send move to server
function makeMove(x, y) {
    if (playerSymbol) {
        socket.emit('makeMove', x, y, playerSymbol);
    }
}

// Update game board
function updateBoard(board) {
    const cells = boardDiv.getElementsByClassName('cell');
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = cells[i * 15 + j];
            cell.innerText = board[i][j] || '';
        }
    }
}
