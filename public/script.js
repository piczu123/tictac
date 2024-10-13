const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const playerNameDisplay = document.getElementById('player-name');
const gameContainer = document.getElementById('game-container');
const matchmakingButton = document.getElementById('find-opponent');
const waitingMessage = document.getElementById('waiting-message');
const gameBoard = document.getElementById('game-board');
const boardElement = document.getElementById('board');
const statusMessage = document.getElementById('status-message');
const errorMessageDisplay = document.getElementById('error-message');

let username;
let socket = io.connect('http://localhost:14053');

loginForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const usernameInput = document.getElementById('login-username').value;
    socket.emit('login', usernameInput);
});

registerForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const usernameInput = document.getElementById('register-username').value;
    const passwordInput = document.getElementById('register-password').value;
    socket.emit('register', { username: usernameInput, password: passwordInput });
});

matchmakingButton.addEventListener('click', function () {
    waitingMessage.style.display = 'block';
    socket.emit('findOpponent', username);
});

function createBoard() {
    boardElement.innerHTML = '';
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.index = `${i}-${j}`;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }
}

function handleCellClick(e) {
    const cell = e.target;
    if (cell.textContent === '' && socket) {
        socket.emit('makeMove', { index: cell.dataset.index, player: username });
    }
}

socket.on('loginSuccess', function (player) {
    username = player;
    playerNameDisplay.textContent = username;
    gameContainer.style.display = 'block';
    document.getElementById('login-register').style.display = 'none';
});

socket.on('registerSuccess', function () {
    alert('Registration successful! You can now log in.');
});

socket.on('loginError', function (message) {
    errorMessageDisplay.textContent = message;
});

socket.on('opponentFound', function (opponent) {
    waitingMessage.style.display = 'none';
    gameBoard.style.display = 'block';
    createBoard();
    statusMessage.textContent = `${username}'s turn`;
});

socket.on('moveMade', function (data) {
    const cell = document.querySelector(`.cell[data-index="${data.index}"]`);
    cell.textContent = data.player === username ? 'X' : 'O';
    statusMessage.textContent = data.nextTurn === username ? `${data.nextTurn}'s turn` : `${data.player}'s turn`;
});

socket.on('gameOver', function (winner) {
    statusMessage.textContent = winner ? `${winner} wins!` : "It's a draw!";
    boardElement.querySelectorAll('.cell').forEach(cell => cell.style.pointerEvents = 'none');
});
