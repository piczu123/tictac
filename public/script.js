const socket = io();

const submitNameButton = document.getElementById('submit-name');
const createRoomButton = document.getElementById('create-room');
const joinRoomButton = document.getElementById('join-room');
const roomNameInput = document.getElementById('room-name');
const playerNameInput = document.getElementById('player-name');
const gameDiv = document.getElementById('game');
const boardDiv = document.getElementById('board');
const statusDiv = document.getElementById('status');
const playersDiv = document.getElementById('players');

let currentRoom;
let playerSymbol;
let playerName;

submitNameButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (playerName) {
        document.getElementById('name-input').style.display = 'none';
        document.getElementById('room-controls').style.display = 'block';
    }
});

createRoomButton.addEventListener('click', () => {
    const roomName = roomNameInput.value.trim();
    if (roomName) {
        socket.emit('createRoom', roomName);
        currentRoom = roomName;
        playerSymbol = 'X';
    }
});

joinRoomButton.addEventListener('click', () => {
    const roomName = roomNameInput.value.trim();
    if (roomName) {
        socket.emit('joinRoom', roomName, playerName);
        currentRoom = roomName;
        playerSymbol = 'O';
    }
});

socket.on('roomCreated', (roomName) => {
    alert(`Room ${roomName} created! You can join using the same room name.`);
    document.getElementById('room-controls').style.display = 'none';
    gameDiv.style.display = 'block';
    initializeBoard();
});

socket.on('roomJoined', (roomName, players) => {
    alert(`Joined room ${roomName} as ${playerSymbol}`);
    document.getElementById('room-controls').style.display = 'none';
    gameDiv.style.display = 'block';
    initializeBoard();
});

socket.on('playerJoined', (playerName) => {
    statusDiv.innerText = `${playerName} joined the game!`;
    updatePlayersList();
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
    if (playerSymbol && socket.connected) {
        socket.emit('makeMove', currentRoom, x, y, playerSymbol);
    }
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

function updatePlayersList() {
    playersDiv.innerHTML = ''; // Clear the current list
    const players = [...Object.values(socket.rooms)].filter(room => room.players).flat();
    players.forEach(player => {
        const playerElement = document.createElement('div');
        playerElement.innerText = player.name;
        playersDiv.appendChild(playerElement);
    });
}
