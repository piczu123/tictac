const socket = io();

const setNameButton = document.getElementById('set-name');
const createRoomButton = document.getElementById('create-room');
const joinRoomButton = document.getElementById('join-room');
const createRoomNameInput = document.getElementById('create-room-name');
const joinRoomNameInput = document.getElementById('join-room-name');
const playerNameInput = document.getElementById('player-name');
const gameDiv = document.getElementById('game');
const boardDiv = document.getElementById('board');
const statusDiv = document.getElementById('status');

let currentRoom;
let playerSymbol;
let playerName;
let isMyTurn = false;

setNameButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (playerName) {
        document.getElementById('name-prompt').style.display = 'none';
        document.getElementById('room-controls').style.display = 'block';
    }
});

createRoomButton.addEventListener('click', () => {
    const roomName = createRoomNameInput.value.trim();
    if (roomName && playerName) {
        socket.emit('createRoom', roomName);
        currentRoom = roomName;
        playerSymbol = 'X'; // Always X for the creator
    }
});

joinRoomButton.addEventListener('click', () => {
    const roomName = joinRoomNameInput.value.trim();
    if (roomName && playerName) {
        socket.emit('joinRoom', roomName, playerName);
        currentRoom = roomName;
        playerSymbol = 'O'; // Always O for the joiner
    }
});

socket.on('roomCreated', (roomName) => {
    alert(`Room ${roomName} created! You are in the game as ${playerSymbol}.`);
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

socket.on('startGame', (firstSymbol) => {
    statusDiv.innerText = `${firstSymbol} goes first!`;
    isMyTurn = firstSymbol === playerSymbol; // Set turn based on symbol
});

function initializeBoard() {
    boardDiv.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.dataset.x = i;
            cell.dataset.y = j;
            cell.addEventListener('click', () => {
                if (isMyTurn) makeMove(i, j);
            });
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
        isMyTurn = (lastMove.playerSymbol !== playerSymbol); // Toggle turn
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
