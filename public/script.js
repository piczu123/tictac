const socket = io();

const playerNameInput = document.getElementById('player-name');
const submitNameButton = document.getElementById('submit-name');
const createRoomButton = document.getElementById('create-room');
const joinRoomButton = document.getElementById('join-room');
const roomNameInput = document.getElementById('room-name');
const gameDiv = document.getElementById('game');
const boardDiv = document.getElementById('board');
const statusDiv = document.getElementById('status');
const playerNamesDiv = document.getElementById('player-names'); // For displaying player names
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

createRoomButton.addEventListener('click', () => {
    const roomName = roomNameInput.value.trim();
    if (roomName && playerName) {
        socket.emit('createRoom', roomName, playerName);
        currentRoom = roomName;
        playerSymbol = 'X';
    }
});

joinRoomButton.addEventListener('click', () => {
    const roomName = roomNameInput.value.trim();
    if (roomName && playerName) {
        socket.emit('joinRoom', roomName, playerName);
        currentRoom = roomName;
        playerSymbol = 'O';
    }
});

socket.on('roomCreated', (roomName) => {
    alert(`Room ${roomName} created!`);
    gameDiv.style.display = 'block';
    initializeBoard();
});

socket.on('roomJoined', (roomName, players) => {
    alert(`Joined room ${roomName} as ${playerSymbol}`);
    gameDiv.style.display = 'block';
    initializeBoard();
});

socket.on('playerJoined', (playerName) => {
    statusDiv.innerText = `${playerName} joined the game!`;
});

socket.on('startGame', (firstPlayer) => {
    statusDiv.innerText = 'Game started! Your turn: ' + playerSymbol;
    // Display player names on the board
    playerNamesDiv.innerText = `Players: ${firstPlayer.name} (X) vs ${currentRoom.players.find(p => p.name !== firstPlayer.name).name} (O)`;
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
    socket.emit('makeMove', x, y, playerSymbol);
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
