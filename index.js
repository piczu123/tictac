const socket = io();

let playerSymbol = null;
let currentPlayer = null;
let boardState = Array(225).fill(null);  // 15x15 grid
let gameStarted = false;

// Generate the 15x15 game board dynamically
function createGameBoard() {
    const boardElement = document.getElementById('board');
    boardElement.innerHTML = '';  // Clear existing cells

    for (let i = 0; i < 225; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', handleCellClick);
        boardElement.appendChild(cell);
    }
}

// When the player connects, receive their symbol (X or O)
socket.on('playerSymbol', function(symbol) {
    playerSymbol = symbol;
    document.getElementById('game-status').textContent = `You are playing as ${playerSymbol}`;
    gameStarted = true;
});

// When the board is updated, update the game board on the client
socket.on('boardUpdate', function(newBoardState, currentTurn) {
    boardState = newBoardState;
    currentPlayer = currentTurn;
    updateGameBoard();
    updateGameStatus();
});

// Handle the player clicking on a cell
function handleCellClick(event) {
    const cellIndex = event.target.getAttribute('data-index');

    // Prevent moves if it's not player's turn or the cell is already occupied
    if (!gameStarted || currentPlayer !== playerSymbol || boardState[cellIndex] !== null) {
        return;
    }

    // Send the move to the server
    socket.emit('makeMove', cellIndex);
}

// Update the game board to reflect the current state
function updateGameBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cell.textContent = boardState[index];
    });
}

function updateGameStatus() {
    document.getElementById('game-status').textContent = `${currentPlayer}'s turn`;
}

// Show the invite link to the user
function showInviteLink() {
    const inviteLink = `${window.location.href}?game=${socket.id}`;
    document.getElementById('invite-link').value = inviteLink;
}

// When the game is ready, display the invite link
socket.on('gameReady', function() {
    showInviteLink();
});

// Create the game board on load
createGameBoard();
