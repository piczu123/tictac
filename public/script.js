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
const playerNamesDiv = document.getElementById('player-names');

let currentRoom;
let playerSymbol;
let playerName;

// Registration and Login Handling
document.getElementById('register-button').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert('Registered successfully! You can now log in.');
        }
    });
});

document.getElementById('login-button').addEventListener('click', () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            playerName = username;
            playerSymbol = 'X'; // Default to 'X' for the first player
            alert(`Logged in successfully! Your ELO: ${data.elo}`);
            namePromptDiv.style.display = 'none';
            roomControlsDiv.style.display = 'block';
        }
    });
});

// Join Queue for Random Matchmaking
document.getElementById('join-queue-button').addEventListener('click', () => {
    fetch('/join-queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
        } else {
            alert('Joined matchmaking queue!');
        }
    });
});

// Socket Events
socket.on('startGame', (players) => {
    currentRoom = players.map(p => p.id);
    boardDiv.innerHTML = '';
    players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.innerText = `Player ${player.id}: ${player.symbol}`;
        playerNamesDiv.appendChild(playerDiv);
    });
    initializeBoard();
});

socket.on('moveMade', (board, lastMove) => {
    renderBoard(board);
    if (lastMove) {
        // Highlight last move, etc.
    }
});

socket.on('gameOver', (winnerSymbol) => {
    alert(`Game Over! Player ${winnerSymbol} wins!`);
    resetGame();
});

function initializeBoard() {
    for (let i = 0; i < 15; i++) {
        const row = document.createElement('div');
        row.className = 'board-row';
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.className = 'board-cell';
            cell.dataset.x = i;
            cell.dataset.y = j;
            cell.addEventListener('click', handleCellClick);
            row.appendChild(cell);
        }
        boardDiv.appendChild(row);
    }
}

function handleCellClick(event) {
    const x = event.target.dataset.x;
    const y = event.target.dataset.y;
    socket.emit('makeMove', currentRoom, x, y, playerSymbol);
}

function renderBoard(board) {
    boardDiv.innerHTML = ''; // Clear existing board
    for (let i = 0; i < 15; i++) {
        const row = document.createElement('div');
        row.className = 'board-row';
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.className = 'board-cell';
            cell.innerText = board[i][j] || '';
            row.appendChild(cell);
        }
        boardDiv.appendChild(row);
    }
}

function resetGame() {
    // Reset the game state here
}
