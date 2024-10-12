const socket = io();

const createRoomButton = document.getElementById('create-room');
const joinRoomButton = document.getElementById('join-room');
const roomNameInput = document.getElementById('room-name');
const playerNameInput = document.getElementById('player-name');
const gameDiv = document.getElementById('game');
const boardDiv = document.getElementById('board');
const statusDiv = document.getElementById('status');

let currentRoom;
let playerSymbol;
let playerName;

createRoomButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert('Please enter your name.');
        return;
    }
    
    const roomName = roomNameInput.value.trim();
    if (roomName) {
        socket.emit('createRoom', roomName);
        currentRoom = roomName;
    }
});

joinRoomButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (!playerName) {
        alert('Please enter your name.');
        return;
    }

    const roomName = roomNameInput.value.trim();
    if (roomName) {
        socket.emit('joinRoom', roomName, playerName);
        currentRoom = roomName;
    }
});

socket.on('roomCreated', (roomName) => {
    alert(`Room ${roomName} created! Join using the same room name.`);
});

socket.on('roomJoined', (roomName, players) => {
    alert(`Joined room ${roomName}`);
    gameDiv.style.display = 'block';
    initializeBoard();
});

socket.on('playerJoined', (newPlayerName, playerSymbol) => {
    statusDiv.innerText = `${newPlayerName} joined the game as ${playerSymbol}`;
});

socket.on('startGame', (startingSymbol) => {
    statusDiv.innerText = `Game started! ${startingSymbol}'s turn`;
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

socket.on('moveMade', (board, lastMove, currentSymbol) => {
    updateBoard(board);
    statusDiv.innerText = `Last move: ${lastMove.playerSymbol} at (${lastMove.x}, ${lastMove.y}). Now it's ${currentSymbol}'s turn.`;
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
    boardDiv.style.pointerEvents = 'none'; // Disable board interactions
});
