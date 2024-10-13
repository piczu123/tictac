const socket = io();
const boardElement = document.getElementById('board');
const gameElement = document.getElementById('game');
const menuElement = document.getElementById('menu');
const waitingMessage = document.getElementById('waitingMessage');
const statusElement = document.getElementById('status');
const loginButton = document.getElementById('loginButton');
const registerButton = document.getElementById('registerButton');

// Initialize the game board
const initBoard = () => {
    boardElement.innerHTML = '';
    for (let i = 0; i < 15 * 15; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', handleCellClick);
        boardElement.appendChild(cell);
    }
};

// Handle cell click
const handleCellClick = (event) => {
    const cell = event.target;
    const index = cell.dataset.index;
    if (!cell.textContent) {
        socket.emit('makeMove', { roomId: roomId, player: currentPlayer, position: index });
        cell.textContent = currentPlayer; // Display player's move
    }
};

// Login functionality
loginButton.addEventListener('click', () => {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    socket.emit('login', { username, password });
});

// Registration functionality
registerButton.addEventListener('click', () => {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    socket.emit('register', { username, password });
});

// Handle game start
socket.on('startGame', ({ player1, player2, roomId }) => {
    currentPlayer = 'X'; // Assign X to the first player
    initBoard();
    gameElement.style.display = 'block';
    menuElement.style.display = 'none';
    waitingMessage.textContent = `Game started between ${player1} and ${player2}.`;
});

// Handle moves made by the opponent
socket.on('moveMade', ({ player, position }) => {
    const cell = boardElement.children[position];
    cell.textContent = player; // Display the opponent's move
});

// Handle login response
socket.on('loginResponse', (data) => {
    if (data.success) {
        socket.emit('joinQueue', data.username);
        menuElement.style.display = 'none';
        waitingMessage.textContent = 'Waiting for an opponent...';
    } else {
        alert(data.message);
    }
});

// Handle registration response
socket.on('registerResponse', (data) => {
    if (data.success) {
        alert('Registration successful! You can now log in.');
    } else {
        alert(data.message);
    }
});
